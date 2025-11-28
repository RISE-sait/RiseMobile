#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read current api/index.ts (or fallback to api.ts for old structure)
let apiPath = path.join(__dirname, '../utils/api/index.ts');
if (!fs.existsSync(apiPath)) {
  apiPath = path.join(__dirname, '../utils/api.ts');
}
const content = fs.readFileSync(apiPath, 'utf-8');

// Extract all export statements (handle multi-line exports)
const exportedNames = new Set();
const exportList = [];

// Remove comments and combine multi-line exports
const cleanContent = content
  .replace(/\/\/.*/g, '') // Remove single-line comments
  .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

// Match all export patterns
const exportRegex = /export\s+(?:{([^}]+)}|(\*)|(?:(const|function|type|interface|class)\s+(\w+)))/g;

let match;
while ((match = exportRegex.exec(cleanContent)) !== null) {
  if (match[1]) {
    // export { a, b, c } from './module'
    const names = match[1].split(',').map(n => n.trim().replace(/^type\s+/, '').replace(/\s+as\s+.+$/, ''));
    names.forEach(name => {
      if (name && !exportedNames.has(name)) {
        exportedNames.add(name);
        exportList.push({
          type: match[1].includes('type ' + name) ? 'type' : 'const',
          name
        });
      }
    });
  } else if (match[2]) {
    // export * from './module'
    const fromMatch = cleanContent.slice(match.index).match(/from\s+['"]([^'"]+)['"]/);
    if (fromMatch) {
      exportList.push({
        type: 'wildcard',
        name: '* (from ' + fromMatch[1] + ')'
      });
    }
  } else if (match[3] && match[4]) {
    // export const/function/type/interface/class name
    const type = match[3];
    const name = match[4];
    if (!exportedNames.has(name)) {
      exportedNames.add(name);
      exportList.push({
        type,
        name
      });
    }
  }
}

// Sort by name for consistent comparison
exportList.sort((a, b) => a.name.localeCompare(b.name));

const result = {
  total: exportList.length,
  exports: exportList,
  timestamp: new Date().toISOString(),
  file: apiPath.replace(path.join(__dirname, '..') + '/', '')
};

console.log(JSON.stringify(result, null, 2));
