const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const regex = /getUnreadCommunications: async \(operatorId: string\): Promise<any\[\]> => \{[\s\S]*?return unread;\n  \},/;

const replacement = `getUnreadCommunications: async (operatorId: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    // Get all mandatory communications that are active, not expired, and target this operator or ALL
    const { data: comms, error: commsError } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario), attachments:communication_attachments(*)')
      .eq('is_active', true);
      
    if (commsError) throw commsError;
    
    const validComms = (comms || []).filter(c => {
      // Check expiration
      if (c.expiration_date && c.expiration_date < today) return false;
      // Check audience
      if (c.target_audience === 'SPECIFIC' && c.target_operator_id !== operatorId) return false;
      return true;
    });
    
    if (validComms.length === 0) return [];
    
    // Now check which ones have been read
    const { data: reads, error: readsError } = await supabase
      .from('communication_recipients')
      .select('communication_id')
      .eq('operator_id', operatorId)
      .in('communication_id', validComms.map(c => c.id));
      
    if (readsError) throw readsError;
    
    const readIds = new Set((reads || []).map(r => r.communication_id));
    return validComms.filter(c => !readIds.has(c.id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/lib/api.ts', code);
