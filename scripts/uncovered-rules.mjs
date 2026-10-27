#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultRulesPath = path.resolve(root, '../skypermit/docs/06-business-rules.md');
const defaultClarificationsPath = path.resolve(root, '../skypermit/docs/07-clarifications.md');
const defaultQuestionsPath = path.resolve(root, '../skypermit/docs/05-open-questions.md');
const defaultCasesPath = path.resolve(root, 'test-cases');
const gateOrder = ['PILOT', 'AIRCRAFT', 'ZONE', 'TIME_WINDOW', 'REGISTRATION'];

function cleanCell(value) {
  return value.trim().replaceAll('`', '').replace(/\s*\*\([^)]*\)\*\s*$/u, '').trim();
}

export function parseRules(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line === '## 6. `rule_reference` values');
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  if (start < 0) throw new Error('Cannot find business-rules §6 rule_reference table');
  const sectionLines = lines.slice(start + 1, end < 0 ? undefined : end);

  const rows = [];
  for (const line of sectionLines) {
    if (!line.startsWith('|') || /^\|\s*(?:Gate|[-: ]+)\s*\|/u.test(line)) continue;
    const rawCells = line.split('|').slice(1, -1);
    const cells = rawCells.map(cleanCell);
    if (cells.length !== 3 || !cells[2]) continue;
    const gate = rawCells[0].includes('(n/a') ? 'REGISTRATION' : cells[0];
    if (!gateOrder.includes(gate)) throw new Error(`Unknown gate in §6: ${gate}; row: ${line}`);
    rows.push({ gate, condition: cells[1], rule_reference: cells[2] });
  }
  if (rows.length === 0) throw new Error('No rule_reference rows found in §6');
  return rows;
}

function section(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start < 0) return '';
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
}

export function coverageFromCase(markdown) {
  if (!/^## ID\s*\nE2E-[A-Z]+-[A-Z]+-\d{3}\s*$/mu.test(markdown) ||
      !/^## Expected result\s*$/mu.test(markdown)) return null;
  const block = section(markdown, 'Business rule');
  const field = (name) => block.match(new RegExp(`^- ${name}:\\s*(.+)$`, 'mu'))?.[1]?.trim().replaceAll('`', '');
  const gate = field('Gate');
  const condition = field('Condition');
  const rule_reference = field('rule_reference');
  if (!gate || !condition || !rule_reference) return null;
  return { gate, condition, rule_reference };
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(location));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(location);
  }
  return files;
}

export async function listUncovered({
  rulesPath = defaultRulesPath,
  clarificationsPath = defaultClarificationsPath,
  questionsPath = defaultQuestionsPath,
  casesPath = defaultCasesPath,
  max = Infinity,
  gate,
} = {}) {
  const [rulesText, clarificationsText, questionsText] = await Promise.all([
    readFile(rulesPath, 'utf8'),
    readFile(clarificationsPath, 'utf8'),
    readFile(questionsPath, 'utf8'),
  ]);
  const allRules = parseRules(rulesText);
  if (!clarificationsText.includes('Weight band → `AIRCRAFT`') ||
      !clarificationsText.includes('Operator authorisation level → `ZONE`')) {
    throw new Error('Cannot confirm gate assignments in 07-clarifications.md');
  }
  for (const rule of allRules) {
    if (rule.condition === 'Weight band not permitted') rule.gate = 'AIRCRAFT';
    if (rule.condition === 'Operator authorisation level too low') rule.gate = 'ZONE';
  }
  const inactiveCitationOpen = /^\| 5 \| Zone `active` flag — citation \| \*\*Open/mu.test(questionsText);
  const seen = new Set();
  for (const file of await markdownFiles(casesPath)) {
    const coverage = coverageFromCase(await readFile(file, 'utf8'));
    if (coverage) seen.add(JSON.stringify(coverage));
  }
  const eligible = allRules.filter((rule) =>
    (!gate || rule.gate === gate) && !seen.has(JSON.stringify(rule)));
  const selected = eligible.slice(0, max).map((rule) => ({
    ...rule,
    ...(inactiveCitationOpen && rule.gate === 'ZONE' && rule.condition === 'Zone inactive'
      ? { open_question: {
          source: '../skypermit/docs/05-open-questions.md §2',
          question: 'Is ZC-2026.1 §4 the confirmed rule_reference for an inactive zone?',
        } }
      : {}),
  }));
  return {
    source: '../skypermit/docs/06-business-rules.md §6',
    clarification: '../skypermit/docs/07-clarifications.md',
    total_uncovered: eligible.length,
    selected_count: selected.length,
    groups: Object.fromEntries(gateOrder
      .filter((name) => !gate || name === gate)
      .map((name) => [name, selected.filter((rule) => rule.gate === name)])),
  };
}

function parseArgs(args) {
  let max = Infinity;
  let gate;
  for (let i = 0; i < args.length; i++) {
    const argument = args[i];
    if (argument === '--max') {
      const raw = args[++i];
      if (!/^[1-9]\d*$/u.test(raw ?? '')) throw new Error('--max must be a positive integer');
      max = Number(raw);
      if (!Number.isSafeInteger(max)) throw new Error('--max is too large');
    } else if (argument === '--gate') {
      gate = args[++i]?.toUpperCase();
      if (!gateOrder.includes(gate)) throw new Error(`--gate must be one of ${gateOrder.join(', ')}`);
    } else if (argument === '--help') {
      process.stdout.write('Usage: node scripts/uncovered-rules.mjs [--max N] [--gate PILOT|AIRCRAFT|ZONE|TIME_WINDOW|REGISTRATION]\n');
      return null;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { max, gate };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options) process.stdout.write(`${JSON.stringify(await listUncovered(options), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
