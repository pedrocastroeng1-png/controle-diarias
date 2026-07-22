const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /\.upload\(fileName, file, \{ upsert: false \}\)/g,
  ".upload(fileName, file, { upsert: false, contentType: file.type || 'application/octet-stream' })"
);

fs.writeFileSync('src/lib/api.ts', code);
