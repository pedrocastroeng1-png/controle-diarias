require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('communications').insert([{title:'a', message:'b', type: 'INFO', priority: 'IMPORTANT', target_audience: 'ALL'}]);
  console.log(error.message);
}
run();
