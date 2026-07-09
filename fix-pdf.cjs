const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'admin', 'Relatorios.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const handleExportPDF = \(\) => \{/, "const handleExportPDF = () => {\n    try {");
content = content.replace(/doc\.save\(`\$\{getFileNameBase\(\)\}\.pdf`\);\n  \};/, "doc.save(`${getFileNameBase()}.pdf`);\n    } catch (e) {\n      setErro('Ocorreu um erro ao gerar o PDF.');\n    }\n  };");

fs.writeFileSync(file, content);
