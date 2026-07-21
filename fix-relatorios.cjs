const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Relatorios.tsx', 'utf8');

// The loadRelatorio function:
const loadMatch = `
  async function loadRelatorio(inicio: string, fim: string, obra: string) {
    setLoading(true);
    setErro('');
    try {
      const data = await api.getRelatorio(inicio, fim, obra);
      setRelatorio(data);
    } catch (e) {
      setErro('Ocorreu um erro ao gerar o relatório.');
    } finally {
      setLoading(false);
    }
  }
`;

// Replace this function with one that fetches atestados as well
const loadReplace = `
  async function loadRelatorio(inicio: string, fim: string, obra: string) {
    setLoading(true);
    setErro('');
    try {
      const [data, atestados, funcionarios] = await Promise.all([
        api.getRelatorio(inicio, fim, obra),
        api.getAtestados(), // Fetch all or we could create a date-filtered one
        api.getFuncionarios('todos')
      ]);
      
      const funcionariosMap = new Map(funcionarios.map(f => [f.id, f]));
      const atestadoRecords = [];
      
      // Parse atestados and create simulated records
      atestados.forEach(atestado => {
        const start = parseISO(atestado.start_date);
        const end = parseISO(atestado.end_date);
        let curr = start;
        
        while (curr <= end) {
          const dateStr = format(curr, 'yyyy-MM-dd');
          
          // Only include if it falls within the requested range
          if ((!inicio || dateStr >= inicio) && (!fim || dateStr <= fim)) {
            const func = funcionariosMap.get(atestado.employee_id);
            if (func) {
              // Check if obra matches
              if (!obra || func.obra?.nome === obra) {
                atestadoRecords.push({
                  id: \`atestado-\${atestado.id}-\${dateStr}\`,
                  data: dateStr,
                  status: 'ATESTADO MÉDICO',
                  funcionario: func.nome,
                  funcao: func.funcao?.nome || '',
                  valor_diaria: func.funcao?.valor_diaria || 0,
                  obra: func.obra?.nome || '',
                  atestado_original_id: atestado.id,
                  atestado_description: atestado.description,
                  atestado_photo_path: atestado.photo_path
                });
              }
            }
          }
          curr = new Date(curr.getTime() + 86400000); // add one day
        }
      });
      
      // Merge and sort
      const merged = [...data, ...atestadoRecords].sort((a, b) => {
        if (a.data > b.data) return -1;
        if (a.data < b.data) return 1;
        return a.funcionario.localeCompare(b.funcionario);
      });
      
      setRelatorio(merged);
    } catch (e) {
      setErro('Ocorreu um erro ao gerar o relatório.');
    } finally {
      setLoading(false);
    }
  }
`;

code = code.replace(/async function loadRelatorio\(inicio: string, fim: string, obra: string\) \{[\s\S]*?setLoading\(false\);\n    \}\n  \}/, loadReplace.trim());

// Render styling for 'ATESTADO MÉDICO' in the table
code = code.replace(
  "status === 'PRESENTE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'",
  "status === 'PRESENTE' ? 'bg-green-100 text-green-800' : status === 'ATESTADO MÉDICO' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-red-100 text-red-800'"
);

// We should also replace the WhatsApp report logic inside Relatorios if it has it, but it doesn't. 
fs.writeFileSync('src/pages/admin/Relatorios.tsx', code);
