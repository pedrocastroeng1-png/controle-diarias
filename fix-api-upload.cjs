const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const uploadCode = `
  uploadPhoto: async (bucket: string, file: File | Blob, prefix: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = \`\${prefix}_\${Date.now()}.\${ext}\`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    
    if (error) {
       console.error("Storage upload error:", error);
       throw error;
    }
    return data.path;
  },
`;

code = code.replace(
  "uploadEmployeePhoto: async",
  uploadCode + "\n  uploadEmployeePhoto: async"
);

fs.writeFileSync('src/lib/api.ts', code);
