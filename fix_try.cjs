const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

const regex = /const \[presencasData, atestados\] = await Promise\.all\(\[/;
code = code.replace(regex, "try {\n      const [presencasData, atestados] = await Promise.all([");

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
