const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const createAttachmentMethod = `
  createCommunicationAttachment: async (payload: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communication_attachments')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
`;

code = code.replace(
  "createCommunication: async",
  createAttachmentMethod + "\n  createCommunication: async"
);

fs.writeFileSync('src/lib/api.ts', code);
