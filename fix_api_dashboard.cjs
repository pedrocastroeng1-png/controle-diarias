const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

// Add comms fetching to getDashboardStats
const getDashboardStatsOriginal = `
    const { data: obras } = await supabase.from('obras').select('id');
    const { data: funcionarios } = await supabase.from('funcionarios').select('id, funcao_id').eq('ativo', true);
    const { data: presencas } = await supabase.from('presencas').select('funcionario_id, presente').eq('data', hoje);
    const { data: funcoes } = await supabase.from('funcoes').select('id, valor_diaria');
`;

const getDashboardStatsNew = `
    const { data: obras } = await supabase.from('obras').select('id');
    const { data: funcionarios } = await supabase.from('funcionarios').select('id, funcao_id').eq('ativo', true);
    const { data: presencas } = await supabase.from('presencas').select('funcionario_id, presente').eq('data', hoje);
    const { data: funcoes } = await supabase.from('funcoes').select('id, valor_diaria');
    
    // Communication stats
    const { data: communications } = await supabase.from('communications').select('id, target_audience, target_operator_id');
    const { data: recipients } = await supabase.from('communication_recipients').select('communication_id, operator_id, read_at');
    const { data: operators } = await supabase.from('usuarios').select('id').eq('perfil', 'OPERADOR');
    
    let totalComms = communications?.length || 0;
    let readComms = recipients?.filter(r => r.read_at)?.length || 0;
    let totalExpectedReads = 0;
    
    const numOperators = operators?.length || 0;
    
    if (communications) {
      communications.forEach(c => {
        if (c.target_audience === 'ALL') {
          totalExpectedReads += numOperators;
        } else {
          totalExpectedReads += 1;
        }
      });
    }
    
    const unreadComms = totalExpectedReads - readComms;
`;

code = code.replace(getDashboardStatsOriginal, getDashboardStatsNew);

code = code.replace(
  "return { totalObras, totalFuncionarios, presentesHoje, faltasHoje, valorTotalHoje };",
  "return { totalObras, totalFuncionarios, presentesHoje, faltasHoje, valorTotalHoje, totalComms, readComms, unreadComms };"
);

fs.writeFileSync('src/lib/api.ts', code);
