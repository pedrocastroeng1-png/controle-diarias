const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /\.upload\((.*?),\s*file,\s*\{ upsert:\s*true \}\)/g,
  ".upload($1, file, { upsert: false })"
);

fs.writeFileSync('src/lib/api.ts', code);
