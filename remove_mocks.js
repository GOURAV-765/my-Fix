const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');

  // Regex to remove: const default... = [ ... ]; or { ... };
  // We match from 'const default' to the next top-level statement or exactly matching the array/object end.
  content = content.replace(/const default[A-Za-z0-9_]+(:\s*[A-Za-z0-9_\[\]<>]+)?\s*=\s*(?:\[[\s\S]*?\]|\{[\s\S]*?\});?/g, '');

  // Regex to replace setX(defaultX) with setX([])
  content = content.replace(/set([A-Za-z]+)\(default[A-Za-z]+\)/g, 'set$1([])');
  
  // Dashboard special case: (error ? defaultMembers : (data?.data || []))
  content = content.replace(/\(error \? defaultMembers : \(data\?\.data \|\| \[\]\)\)/g, '(data?.data || [])');

  fs.writeFileSync(p, content);
});

console.log('Removed mock data.');
