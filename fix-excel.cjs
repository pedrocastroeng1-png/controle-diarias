const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'admin', 'Relatorios.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const handleExportExcel = async \(\) => \{/, "const handleExportExcel = async () => {\n    try {");
content = content.replace(/saveAs\(new Blob\(\[buffer\]\), `\$\{getFileNameBase\(\)\}\.xlsx`\);\n  \};/, "saveAs(new Blob([buffer]), `${getFileNameBase()}.xlsx`);\n    } catch (e) {\n      setErro('Ocorreu um erro ao exportar o Excel.');\n    }\n  };");

fs.writeFileSync(file, content);
