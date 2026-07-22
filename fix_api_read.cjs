const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const readMethod = `
  markCommunicationRead: async (communicationId: string, operatorId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('communication_recipients')
      .upsert({
        communication_id: communicationId,
        operator_id: operatorId,
        read_at: new Date().toISOString()
      }, { onConflict: 'communication_id, operator_id' });
    if (error) throw error;
  },
`;

code = code.replace(
  "createCommunication: async",
  readMethod + "\n  createCommunication: async"
);

fs.writeFileSync('src/lib/api.ts', code);
