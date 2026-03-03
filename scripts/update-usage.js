const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
const OUTPUT_FILE = path.join(process.env.HOME, '.openclaw/workspace/mission-control/public/data/usage.json');

function parseSessionFile(filePath) {
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

const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl') && !f.includes('.deleted') && !f.includes('.bak') && !f.includes('.lock') && !f.includes('.reset'));
console.log('Parsing ' + files.length + ' session files...');

let allEntries = [];
for (const file of files) {
  allEntries.push(...parseSessionFile(path.join(SESSIONS_DIR, file)));
}
console.log('Found ' + allEntries.length + ' usage entries total.');

const dailyUsage = {};
for (const e of allEntries) {
  if (!dailyUsage[e.date]) {
    dailyUsage[e.date] = { date: e.date, totalInputTokens: 0, totalOutputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0, estimatedCost: 0, messageCount: 0, models: {} };
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
}

for (const d of Object.values(dailyUsage)) {
  d.estimatedCost = Math.round(d.estimatedCost * 1000000) / 1000000;
}

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

const sorted = allEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
const output = {
  lastUpdated: new Date().toISOString(),
  generatedBy: 'update-usage.js (auto-parsed from OpenClaw sessions)',
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
  console.log('  ' + date + ': $' + d.estimatedCost.toFixed(4) + ' (' + d.messageCount + ' msgs, ' + d.totalTokens.toLocaleString() + ' tokens)');
}
