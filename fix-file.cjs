const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Relatorios.tsx', 'utf8');
const badStr = `const handleExportDailyPDF = async () => {\n    const targetDate = dataInicial || hoje;\n    const dailyData = relatorio;`;
content = content.split(badStr).join('');
fs.writeFileSync('src/pages/admin/Relatorios.tsx', content);
