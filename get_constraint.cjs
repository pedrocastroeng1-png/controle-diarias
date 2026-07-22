require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const priorities = ['1', '2', '3'];
  for (const p of priorities) {
     const res = await supabase.from('communications').insert([{title:'a', message:'b', type: 'INFO', priority: p, target_audience: 'ALL'}]);
     console.log(`Priority ${p}:`, res.error ? res.error.message : 'SUCCESS');
  }
}
run();
