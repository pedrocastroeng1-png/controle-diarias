const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'admin', 'Relatorios.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const handleExportDailyPDF = async \(\) => \{\n    const targetDate = dataInicial || hoje;\n    \n    \/\/ Fetch specifically for this single date to ensure accuracy\n    setLoading\(true\);\n    let dailyData: any\[\] = \[\];\n    try \{\n      const obraSelecionada = obras.find\(o => o.id === obraId\)\?.nome \|\| undefined;\n      dailyData = await api.getRelatorio\(targetDate, targetDate, obraSelecionada\);\n    \} catch \(e\) \{\n      setErro\('Ocorreu um erro ao gerar o relatório diário.'\);\n    \} finally \{\n      setLoading\(false\);\n    \}/g, `const handleExportDailyPDF = async () => {
    const targetDate = dataInicial || hoje;
    const dailyData = relatorio;`);

content = content.replace(/<div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 print:hidden">\s*<h3 className="text-lg font-medium text-gray-900 mb-4">Debug Relatório<\/h3>\s*<pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">\s*\{JSON\.stringify\(relatorio, null, 2\)\}\s*<\/pre>\s*<\/div>/g, '');

fs.writeFileSync(file, content);
