#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read current api.ts
const apiPath = path.join(__dirname, '../utils/api.ts');
const content = fs.readFileSync(apiPath, 'utf-8');

// Extract all export statements
const lines = content.split('\n');
const exportList = [];

lines.forEach((line, index) => {
  // Match export patterns
  const exportMatch = line.match(/^export\s+(const|function|type|interface|class|async\s+function)\s+(\w+)/);

  if (exportMatch) {
    const type = exportMatch[1].replace('async function', 'function');
    const name = exportMatch[2];
    exportList.push({
      type,
      name,
      line: index + 1
    });
  }
});

// Sort by name for consistent comparison
exportList.sort((a, b) => a.name.localeCompare(b.name));

const result = {
  total: exportList.length,
  exports: exportList,
  timestamp: new Date().toISOString(),
  file: 'utils/api.ts'
};

console.log(JSON.stringify(result, null, 2));
