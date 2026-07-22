const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');
code = code.replace(/MANDATORY/g, 'URGENT');
fs.writeFileSync('src/pages/admin/Communications.tsx', code);
