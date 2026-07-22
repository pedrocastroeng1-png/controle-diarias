const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

code = code.replace(
  /<option value="NORMAL">Normal<\/option>\s*<option value="MANDATORY">Obrigatória \(Bloqueia Presença\)<\/option>/,
  '<option value="NORMAL">Normal</option>\n                          <option value="IMPORTANT">Importante</option>\n                          <option value="URGENT">Urgente</option>'
);

fs.writeFileSync('src/pages/admin/Communications.tsx', code);
