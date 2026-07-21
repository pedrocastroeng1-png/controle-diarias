const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const apiCode = `
  // Communications
  getCommunications: async (): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario), target_operator:usuarios!target_operator_id(id, usuario)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getUnreadMandatoryCommunications: async (operatorId: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const today = new Date().toISOString().split('T')[0];
    
    // Get all mandatory communications that are active, not expired, and target this operator or ALL
    const { data: comms, error: commsError } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario)')
      .eq('is_active', true)
      .eq('priority', 'MANDATORY');
      
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
      .from('communication_reads')
      .select('communication_id')
      .eq('operator_id', operatorId)
      .in('communication_id', validComms.map(c => c.id));
      
    if (readsError) throw readsError;
    
    const readIds = new Set((reads || []).map(r => r.communication_id));
    return validComms.filter(c => !readIds.has(c.id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  
  getCommunicationReads: async (communicationId: string): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communication_reads')
      .select('*, operator:usuarios!operator_id(id, usuario)')
      .eq('communication_id', communicationId)
      .order('read_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createCommunication: async (payload: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateCommunication: async (id: string, payload: any): Promise<any> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('communications')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteCommunication: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  markCommunicationAsRead: async (communicationId: string, operatorId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase
      .from('communication_reads')
      .insert([{ communication_id: communicationId, operator_id: operatorId }]);
    if (error) throw error;
  },

  getOperators: async (): Promise<any[]> => {
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario')
      .eq('perfil', 'OPERADOR')
      .eq('ativo', true);
    if (error) throw error;
    return data || [];
  },
`;

code = code.replace("export const api = {", "export const api = {\n" + apiCode);
fs.writeFileSync('src/lib/api.ts', code);
