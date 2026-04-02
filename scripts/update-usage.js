const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.env.HOME, '.openclaw/agents');
const CLAUDE_PROJECTS_DIR = path.join(process.env.HOME, '.claude/projects');
const OUTPUT_FILE = path.join(process.env.HOME, '.openclaw/workspace/mission-control/public/data/usage.json');

// Pricing per million tokens (Anthropic API pricing)
const MODEL_PRICING = {
  'claude-opus-4-6':              { input: 15,   output: 75,  cacheRead: 1.5,  cacheWrite: 18.75 },
  'claude-sonnet-4-20250514':     { input: 3,    output: 15,  cacheRead: 0.30, cacheWrite: 3.75  },
  'claude-sonnet-4-5-20250929':   { input: 3,    output: 15,  cacheRead: 0.30, cacheWrite: 3.75  },
  'claude-haiku-4-5-20251001':    { input: 0.80, output: 4,   cacheRead: 0.08, cacheWrite: 1     },
  'claude-haiku-4-5-20250929':    { input: 0.80, output: 4,   cacheRead: 0.08, cacheWrite: 1     },
  'claude-3-haiku-20240307':      { input: 0.25, output: 1.25,cacheRead: 0.03, cacheWrite: 0.30  },
};
const DEFAULT_PRICING = { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 }; // Sonnet as fallback

function calculateCost(model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens) {
  const p = MODEL_PRICING[model] || DEFAULT_PRICING;
  return (
    (inputTokens * p.input / 1_000_000) +
    (outputTokens * p.output / 1_000_000) +
    (cacheReadTokens * p.cacheRead / 1_000_000) +
    (cacheWriteTokens * p.cacheWrite / 1_000_000)
  );
}

// Parse OpenClaw agent session files (have pre-calculated cost)
function parseOpenClawSession(filePath) {
  const entries = [];
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj && obj.message && obj.message.usage && obj.message.usage.cost && obj.message.usage.cost.total && obj.timestamp) {
          const u = obj.message.usage;
          entries.push({
            timestamp: obj.timestamp,
            date: obj.timestamp.slice(0, 10),
            model: obj.message.model || 'unknown',
            provider: obj.message.provider || 'unknown',
            source: 'openclaw',
            input: u.input || 0,
            output: u.output || 0,
            cacheRead: u.cacheRead || 0,
            cacheWrite: u.cacheWrite || 0,
            totalTokens: u.totalTokens || 0,
            cost: u.cost.total || 0,
          });
        }
      } catch (e) {}
    }
  } catch (e) {}
  return entries;
}

// Parse Claude Code interactive session files (raw Anthropic format, no pre-calculated cost)
function parseClaudeCodeSession(filePath) {
  const entries = [];
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type !== 'assistant' || !obj.message || !obj.message.usage || !obj.timestamp) continue;
        const u = obj.message.usage;
        if (!u.input_tokens && !u.output_tokens) continue;

        const model = obj.message.model || 'unknown';
        const inputTokens = u.input_tokens || 0;
        const outputTokens = u.output_tokens || 0;
        const cacheReadTokens = u.cache_read_input_tokens || 0;
        const cacheWriteTokens = u.cache_creation_input_tokens || 0;
        const totalTokens = inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens;
        const cost = calculateCost(model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens);

        entries.push({
          timestamp: obj.timestamp,
          date: obj.timestamp.slice(0, 10),
          model: model,
          provider: 'anthropic',
          source: 'claude-code',
          input: inputTokens,
          output: outputTokens,
          cacheRead: cacheReadTokens,
          cacheWrite: cacheWriteTokens,
          totalTokens: totalTokens,
          cost: cost,
        });
      } catch (e) {}
    }
  } catch (e) {}
  return entries;
}

// ─── Scan OpenClaw agent sessions ───
let allEntries = [];
let totalFiles = 0;
let openclawFiles = 0;
let claudeCodeFiles = 0;

try {
  const agentDirs = fs.readdirSync(AGENTS_DIR).filter(d => {
    try { return fs.statSync(path.join(AGENTS_DIR, d, 'sessions')).isDirectory(); } catch { return false; }
  });

  for (const agent of agentDirs) {
    const sessDir = path.join(AGENTS_DIR, agent, 'sessions');
    const files = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl') && !f.includes('.deleted') && !f.includes('.bak') && !f.includes('.lock') && !f.includes('.reset'));
    console.log('OpenClaw agent "' + agent + '": ' + files.length + ' session files');
    openclawFiles += files.length;
    totalFiles += files.length;
    for (const file of files) {
      allEntries.push(...parseOpenClawSession(path.join(sessDir, file)));
    }
  }
} catch (e) {
  console.log('Warning: Could not scan OpenClaw agents dir: ' + e.message);
}

// ─── Scan Claude Code project sessions ───
try {
  const projectDirs = fs.readdirSync(CLAUDE_PROJECTS_DIR).filter(d => {
    try { return fs.statSync(path.join(CLAUDE_PROJECTS_DIR, d)).isDirectory(); } catch { return false; }
  });

  for (const proj of projectDirs) {
    const projDir = path.join(CLAUDE_PROJECTS_DIR, proj);
    const files = fs.readdirSync(projDir).filter(f => f.endsWith('.jsonl'));
    if (files.length > 0) {
      console.log('Claude Code project "' + proj + '": ' + files.length + ' session files');
      claudeCodeFiles += files.length;
      totalFiles += files.length;
      for (const file of files) {
        allEntries.push(...parseClaudeCodeSession(path.join(projDir, file)));
      }
    }
  }
} catch (e) {
  console.log('Warning: Could not scan Claude Code projects dir: ' + e.message);
}

console.log('Total: ' + totalFiles + ' files (' + openclawFiles + ' OpenClaw + ' + claudeCodeFiles + ' Claude Code), ' + allEntries.length + ' usage entries.');

// ─── Aggregate by day ───
const dailyUsage = {};
for (const e of allEntries) {
  if (!dailyUsage[e.date]) {
    dailyUsage[e.date] = { date: e.date, totalInputTokens: 0, totalOutputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0, estimatedCost: 0, messageCount: 0, models: {}, sources: {} };
  }
  const d = dailyUsage[e.date];
  d.totalInputTokens += e.input;
  d.totalOutputTokens += e.output;
  d.cacheReadTokens += e.cacheRead;
  d.cacheWriteTokens += e.cacheWrite;
  d.totalTokens += e.totalTokens;
  d.estimatedCost += e.cost;
  d.messageCount += 1;
  d.models[e.model] = (d.models[e.model] || 0) + 1;
  d.sources[e.source] = (d.sources[e.source] || 0) + 1;
}

for (const d of Object.values(dailyUsage)) {
  d.estimatedCost = Math.round(d.estimatedCost * 1000000) / 1000000;
}

// ─── Aggregate by month ───
const monthlyUsage = {};
for (const [date, d] of Object.entries(dailyUsage)) {
  const month = date.slice(0, 7);
  if (!monthlyUsage[month]) {
    monthlyUsage[month] = { month: month, totalInputTokens: 0, totalOutputTokens: 0, totalTokens: 0, estimatedCost: 0, dayCount: 0, messageCount: 0 };
  }
  const m = monthlyUsage[month];
  m.totalInputTokens += d.totalInputTokens;
  m.totalOutputTokens += d.totalOutputTokens;
  m.totalTokens += d.totalTokens;
  m.estimatedCost += d.estimatedCost;
  m.messageCount += d.messageCount;
  m.dayCount += 1;
}
for (const m of Object.values(monthlyUsage)) {
  m.estimatedCost = Math.round(m.estimatedCost * 1000000) / 1000000;
  m.averageDailyCost = Math.round((m.estimatedCost / m.dayCount) * 100) / 100;
}

// ─── Write output ───
const sorted = allEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
const output = {
  lastUpdated: new Date().toISOString(),
  generatedBy: 'update-usage.js (OpenClaw agents + Claude Code interactive sessions)',
  dailyUsage: dailyUsage,
  monthlyUsage: monthlyUsage,
  summary: {
    totalCost: Math.round(Object.values(monthlyUsage).reduce((a, m) => a + m.estimatedCost, 0) * 100) / 100,
    totalMessages: allEntries.length,
    totalTokens: allEntries.reduce((a, e) => a + e.totalTokens, 0),
    dateRange: { from: sorted.length ? sorted[0].date : null, to: sorted.length ? sorted[sorted.length - 1].date : null },
  },
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log('Written to ' + OUTPUT_FILE);
console.log('Total cost: $' + output.summary.totalCost);
console.log('Total messages: ' + output.summary.totalMessages);
console.log('Date range: ' + output.summary.dateRange.from + ' to ' + output.summary.dateRange.to);
console.log('');
console.log('Daily breakdown:');
for (const [date, d] of Object.entries(dailyUsage).sort()) {
  const sources = Object.entries(d.sources || {}).map(([s, c]) => `${s}:${c}`).join(' ');
  console.log('  ' + date + ': $' + d.estimatedCost.toFixed(2) + ' (' + d.messageCount + ' msgs) [' + sources + ']');
}
