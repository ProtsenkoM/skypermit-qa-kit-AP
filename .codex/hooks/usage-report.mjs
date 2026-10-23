#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const hookDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(hookDir, '../..');
const pricesPath = path.join(hookDir, 'usage-prices.json');
const tokenFields = [
  'input_tokens',
  'cached_input_tokens',
  'cache_write_input_tokens',
  'output_tokens',
  'reasoning_output_tokens',
  'total_tokens',
];

function tokens(usage) {
  return Object.fromEntries(tokenFields.map((key) => [key, Number(usage?.[key] ?? 0)]));
}

function addTokens(total, usage) {
  for (const key of tokenFields) total[key] += usage[key];
}

async function readStdin() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  return JSON.parse(input);
}

async function readTranscript(transcriptPath, sessionId) {
  const turns = new Map();
  const usageRecords = new Map();
  const subagents = new Map();
  const pendingSpawns = new Map();
  const compactions = new Set();
  let transcriptSessionId;
  let lineNumber = 0;

  const lines = createInterface({
    input: createReadStream(transcriptPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    lineNumber += 1;
    if (!line.trim()) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid transcript JSON at line ${lineNumber}: ${error.message}`);
    }
    const payload = record.payload ?? {};
    if (record.type === 'session_meta') {
      transcriptSessionId = payload.session_id ?? payload.id;
    } else if (record.type === 'turn_context') {
      if (payload.turn_id && payload.model) turns.set(payload.turn_id, payload.model);
    } else if (record.type === 'token_usage_record') {
      if (payload.session_id !== sessionId) continue;
      // The observed `usage` is a response delta; `thread_token_usage` is cumulative.
      // A response ID is unique in the inspected transcript. Keep the last record
      // if a future Codex version writes an updated record for the same response.
      const key = payload.response_id ?? `line:${lineNumber}`;
      usageRecords.set(key, { turnId: payload.turn_id, usage: tokens(payload.usage) });
    } else if (record.type === 'compacted') {
      compactions.add(payload.compaction_response_id ?? `line:${lineNumber}`);
    } else if (record.type === 'response_item') {
      if (payload.type === 'compaction') {
        compactions.add(payload.id ?? `line:${lineNumber}`);
      } else if (payload.type === 'function_call' && payload.name === 'spawn_agent') {
        let args = {};
        try { args = JSON.parse(payload.arguments ?? '{}'); } catch { /* unavailable */ }
        const name = typeof args.task_name === 'string' ? args.task_name : '(unnamed)';
        const key = payload.call_id ?? `line:${lineNumber}`;
        pendingSpawns.set(key, name);
        subagents.set(key, name);
      } else if (payload.type === 'function_call_output' && pendingSpawns.has(payload.call_id)) {
        try {
          const output = JSON.parse(payload.output ?? '{}');
          if (typeof output.task_name === 'string') subagents.set(payload.call_id, output.task_name);
        } catch { /* task name from the call is still available */ }
      }
    }
  }

  if (transcriptSessionId !== sessionId) {
    throw new Error(`Session mismatch: stdin=${sessionId}, transcript=${transcriptSessionId ?? '(missing)'}`);
  }
  const byModel = new Map();
  for (const { turnId, usage } of usageRecords.values()) {
    const model = turns.get(turnId) ?? '(unknown model)';
    if (!byModel.has(model)) byModel.set(model, tokens());
    addTokens(byModel.get(model), usage);
  }
  return { byModel, subagents: [...subagents.values()], compactCount: compactions.size, responseCount: usageRecords.size };
}

async function readPrices() {
  try {
    return JSON.parse(await readFile(pricesPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

function calculateCost(usage, rates) {
  if (!rates || !['input', 'cached_input', 'output'].every((key) => Number.isFinite(rates[key]))) return null;
  if (usage.cache_write_input_tokens && !Number.isFinite(rates.cache_write_input)) return null;
  if (usage.cached_input_tokens + usage.cache_write_input_tokens > usage.input_tokens) return null;
  const ordinaryInput = usage.input_tokens - usage.cached_input_tokens - usage.cache_write_input_tokens;
  return (
    ordinaryInput * rates.input +
    usage.cached_input_tokens * rates.cached_input +
    usage.cache_write_input_tokens * (rates.cache_write_input ?? 0) +
    usage.output_tokens * rates.output
  ) / 1_000_000;
}

function renderReport(sessionId, transcriptPath, result, prices) {
  const date = new Date().toLocaleDateString('en-CA');
  const rows = [];
  let total = 0;
  let fullyPriced = true;
  for (const [model, usage] of [...result.byModel].sort(([a], [b]) => a.localeCompare(b))) {
    const cost = calculateCost(usage, prices[model]);
    if (cost === null) fullyPriced = false;
    else total += cost;
    rows.push(`| ${model} | ${usage.input_tokens} | ${usage.cached_input_tokens} | ${usage.cache_write_input_tokens} | ${usage.output_tokens} | ${usage.reasoning_output_tokens} | ${cost === null ? 'N/A' : `$${cost.toFixed(6)}`} |`);
  }
  const agentNames = result.subagents.length ? result.subagents.map((name) => `- ${name}`).join('\n') : '- None recorded';
  return `# Codex usage report\n\n` +
    `- Date: ${date}\n- Session ID: ${sessionId}\n- Transcript: \`${transcriptPath}\`\n` +
    `- Response usage records: ${result.responseCount}\n- Compact events: ${result.compactCount}\n` +
    `- Estimated cost: ${fullyPriced ? `$${total.toFixed(6)}` : 'N/A (missing or invalid model rates)'}\n\n` +
    `## Usage by model\n\n` +
    `Rates are USD per 1 million tokens. Input includes cached input; reasoning output is included in output.\n\n` +
    `| Model | Input | Cached input | Cache write input | Output | Reasoning output | Estimated cost |\n` +
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n` +
    `${rows.join('\n') || '| (none) | 0 | 0 | 0 | 0 | 0 | $0.000000 |'}\n\n` +
    `## Subagents launched\n\n${agentNames}\n\n` +
    `Only usage records with this session ID are summed. Separate subagent transcripts are not traversed.\n`;
}

async function main() {
  const event = await readStdin();
  if (event.hook_event_name !== 'SessionEnd') throw new Error('Expected a SessionEnd hook event');
  if (!/^[a-zA-Z0-9_-]+$/.test(event.session_id ?? '')) throw new Error('Invalid session_id');
  if (typeof event.transcript_path !== 'string') throw new Error('Missing transcript_path');
  const result = await readTranscript(event.transcript_path, event.session_id);
  const prices = await readPrices();
  const date = new Date().toLocaleDateString('en-CA');
  const reportDir = path.join(repoRoot, 'reports/ws2');
  await mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `${date}-${event.session_id}.md`);
  await writeFile(reportPath, renderReport(event.session_id, event.transcript_path, result, prices));
}

main().catch((error) => {
  console.error(`usage-report: ${error.message}`);
  process.exitCode = 1;
});
