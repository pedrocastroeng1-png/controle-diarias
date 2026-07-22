const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const original = `    return {
      totalObras: obrasCount || 0,
      totalFuncionarios: funcionariosCount || 0,
      presentesHoje,
      faltasHoje,
      valorTotalHoje
    };`;

const newCode = `
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

    return {
      totalObras: obrasCount || 0,
      totalFuncionarios: funcionariosCount || 0,
      presentesHoje,
      faltasHoje,
      valorTotalHoje,
      totalComms,
      readComms,
      unreadComms
    };`;

code = code.replace(original, newCode);
fs.writeFileSync('src/lib/api.ts', code);
