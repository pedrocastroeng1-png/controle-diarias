const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Relatorios.tsx', 'utf8');

const badBlock = `|| hoje;
    
    // Fetch specifically for this single date to ensure accuracy
    setLoading(true);
    let dailyData: any[] = [];
    try {
      const obraSelecionada = obras.find(o => o.id === obraId)?.nome || undefined;
      dailyData = await api.getRelatorio(targetDate, targetDate, obraSelecionada);
    } catch (e) {
      setErro('Ocorreu um erro ao gerar o relatório diário.');
    } finally {
      setLoading(false);
    }`;

const goodBlock = `const handleExportDailyPDF = async () => {
    const targetDate = dataInicial || hoje;
    const dailyData = relatorio;`;

content = content.replace(badBlock, goodBlock);
fs.writeFileSync('src/pages/admin/Relatorios.tsx', content);
