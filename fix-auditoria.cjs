const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AuditoriaPresencas.tsx', 'utf8');

// Modify the loading of Presencas
const searchLoad = `
      const history = await api.getAuditoriaPresencas(f.id);
      setPresencas(history);
`;

const replaceLoad = `
      const [history, atestados] = await Promise.all([
        api.getAuditoriaPresencas(f.id),
        api.getAtestados()
      ]);
      
      const atestadosForFunc = atestados.filter(a => a.employee_id === f.id);
      const generatedAtestados: any[] = [];
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 15);
      const dataLimiteStr = dataLimite.toISOString().split('T')[0];
      
      atestadosForFunc.forEach(a => {
        let curr = new Date(a.start_date);
        let end = new Date(a.end_date);
        while (curr <= end) {
          const dateStr = curr.toISOString().split('T')[0];
          if (dateStr >= dataLimiteStr) {
            generatedAtestados.push({
              id: \`atestado-\${a.id}-\${dateStr}\`,
              data: dateStr,
              photo_path: a.photo_path,
              photo_bucket: 'medical-certificates', // Custom property to identify bucket
              is_atestado: true
            });
          }
          curr.setDate(curr.getDate() + 1);
        }
      });
      
      const merged = [...history, ...generatedAtestados].sort((a, b) => b.data.localeCompare(a.data));
      setPresencas(merged);
`;

code = code.replace(searchLoad.trim(), replaceLoad.trim());

// Inside openModal, handle the bucket logic
const openModalSearch = `
    try {
      if (presenca.photo_path) {
         console.log('Generating signed URL for attendance-photos:', presenca.photo_path);
         const url = await api.getPhotoUrl('attendance-photos', presenca.photo_path);
`;

const openModalReplace = `
    try {
      if (presenca.photo_path) {
         const bucket = (presenca as any).is_atestado ? 'medical-certificates' : 'attendance-photos';
         console.log(\`Generating signed URL for \${bucket}:\`, presenca.photo_path);
         const url = await api.getPhotoUrl(bucket, presenca.photo_path);
`;

code = code.replace(openModalSearch.trim(), openModalReplace.trim());

// In the UI, render "ATESTADO MÉDICO"
code = code.replace(
  "{/* Simulated Operator logic since operator isn't explicitly in the schema */}\n                                Operador Registrou",
  "{(p as any).is_atestado ? 'Atestado Médico (Administrador)' : 'Operador Registrou'}"
);

// In the Modal, render "Foto da Presença" -> "Foto da Presença / Atestado"
code = code.replace(
  '<span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Foto da Presença</span>',
  '<span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">{(selectedPresenca as any)?.is_atestado ? "Atestado Médico" : "Foto da Presença"}</span>'
);

fs.writeFileSync('src/pages/admin/AuditoriaPresencas.tsx', code);
