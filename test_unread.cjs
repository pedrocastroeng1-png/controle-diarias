require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const operatorId = '47bdeec7-c0f5-4309-8fa9-768a8fbcf120'; // I need a valid operator ID
  
  // First, find an operator
  const { data: ops } = await supabase.from('usuarios').select('id').eq('perfil', 'OPERADOR').limit(1);
  if (!ops || ops.length === 0) return console.log("No operator");
  const opId = ops[0].id;
  
  const now = new Date();
  const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  const { data: comms } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario), attachments:communication_attachments(*)')
      .eq('is_active', true);
      
  const validComms = (comms || []).filter(c => {
      // Check expiration
      if (c.expiration_date && c.expiration_date < today) return false;
      // Check audience
      if (c.target_audience === 'SPECIFIC' && c.target_operator_id !== opId) return false;
      return true;
  });
  
  console.log("Valid comms:", validComms.length);
  
  if (validComms.length === 0) return;
  
  const { data: reads, error: readsError } = await supabase
      .from('communication_recipients')
      .select('communication_id')
      .eq('operator_id', opId)
      .in('communication_id', validComms.map(c => c.id));
      
  const readIds = new Set((reads || []).map(r => r.communication_id));
  const unread = validComms.filter(c => !readIds.has(c.id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  console.log("Unread comms:", unread.map(u => u.title));
}
run();
