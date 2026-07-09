const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'admin', 'Relatorios.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/alert\('Ocorreu um erro ao gerar o relatório diário.'\);/, "setErro('Ocorreu um erro ao gerar o relatório diário.');");

fs.writeFileSync(file, content);
