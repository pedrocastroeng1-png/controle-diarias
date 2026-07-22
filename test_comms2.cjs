require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: comms } = await supabase
      .from('communications')
      .select('*, creator:usuarios!created_by(id, usuario), attachments:communication_attachments(*)')
      .eq('is_active', true);
  console.log(JSON.stringify(comms, null, 2));
}
run();
