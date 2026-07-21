const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Relatorios.tsx', 'utf8');

code = code.replace(
  "if (p.status === 'PRESENTE') {",
  "if (p.status === 'PRESENTE' || p.status === 'ATESTADO MÉDICO') {"
);

code = code.replace(
  "const isPresente = p.status === 'PRESENTE';",
  "const isPresente = p.status === 'PRESENTE' || p.status === 'ATESTADO MÉDICO';"
);

fs.writeFileSync('src/pages/admin/Relatorios.tsx', code);
