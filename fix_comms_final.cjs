const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

// replace MANDATORY with URGENT
code = code.replace(/MANDATORY/g, 'URGENT');
// remove IMPORTANT option
code = code.replace(/<option value="IMPORTANT">Importante<\/option>\n\s*/g, '');

fs.writeFileSync('src/pages/admin/Communications.tsx', code);
