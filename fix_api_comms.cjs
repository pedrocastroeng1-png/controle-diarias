const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  "getUnreadMandatoryCommunications: async (operatorId: string): Promise<any[]> => {",
  "getUnreadCommunications: async (operatorId: string): Promise<any[]> => {"
);

code = code.replace(
  /const \{ data: comms, error: commsError \} = await supabase\s*\.from\('communications'\)\s*\.select\('\*, creator:usuarios!created_by\(id, usuario\)'\)\s*\.eq\('is_active', true\)\s*\.eq\('priority', 'MANDATORY'\);/,
  "const { data: comms, error: commsError } = await supabase\n      .from('communications')\n      .select('*, creator:usuarios!created_by(id, usuario), attachments:communication_attachments(*)')\n      .eq('is_active', true);"
);

fs.writeFileSync('src/lib/api.ts', code);
