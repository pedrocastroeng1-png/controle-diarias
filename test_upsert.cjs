require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const opId = '47bdeec7-c0f5-4309-8fa9-768a8fbcf120';
  const commId = 'd2e3c884-a7e6-463a-9acd-16e35d2c284f';
  
  const { error } = await supabase
      .from('communication_recipients')
      .upsert({
        communication_id: commId,
        operator_id: opId,
        read_at: new Date().toISOString()
      }, { onConflict: 'communication_id, operator_id' });
  console.log("Error:", error);
}
run();
