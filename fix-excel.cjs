const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Relatorios.tsx', 'utf8');

code = code.replace(
  "status: isPresente ? '✔ Presente' : '✘ Faltou'",
  "status: p.status === 'ATESTADO MÉDICO' ? '🩺 Atestado Médico' : (p.status === 'PRESENTE' ? '✔ Presente' : '✘ Faltou')"
);

fs.writeFileSync('src/pages/admin/Relatorios.tsx', code);
