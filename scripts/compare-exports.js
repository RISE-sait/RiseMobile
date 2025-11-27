#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const beforePath = path.join(__dirname, '../temp/api-split/exports-before.json');
const afterPath = path.join(__dirname, '../temp/api-split/exports-after.json');

// Check if files exist
if (!fs.existsSync(beforePath)) {
  console.error('❌ Before snapshot not found:', beforePath);
  process.exit(1);
}

if (!fs.existsSync(afterPath)) {
  console.error('❌ After snapshot not found:', afterPath);
  process.exit(1);
}

const before = JSON.parse(fs.readFileSync(beforePath, 'utf-8'));
const after = JSON.parse(fs.readFileSync(afterPath, 'utf-8'));

const beforeNames = before.exports.map(e => e.name).sort();
const afterNames = after.exports.map(e => e.name).sort();

const missing = beforeNames.filter(n => !afterNames.includes(n));
const added = afterNames.filter(n => !beforeNames.includes(n));

console.log('\n📊 Export Comparison:');
console.log('═'.repeat(60));
console.log(`  Before: ${before.total} exports (${before.timestamp})`);
console.log(`  After:  ${after.total} exports (${after.timestamp})`);
console.log('═'.repeat(60));

if (missing.length > 0) {
  console.log('\n❌ Missing exports:');
  missing.forEach(name => {
    const exp = before.exports.find(e => e.name === name);
    console.log(`  - ${name} (${exp.type}, line ${exp.line})`);
  });
}

if (added.length > 0) {
  console.log('\n➕ Added exports:');
  added.forEach(name => {
    const exp = after.exports.find(e => e.name === name);
    console.log(`  - ${name} (${exp.type})`);
  });
}

if (missing.length === 0 && added.length === 0) {
  console.log('\n✅ All exports match perfectly!');
  console.log(`   Total: ${before.total} exports\n`);
  process.exit(0);
} else {
  console.log('\n❌ Export mismatch detected!');
  console.log(`   Missing: ${missing.length}, Added: ${added.length}\n`);
  process.exit(1);
}
