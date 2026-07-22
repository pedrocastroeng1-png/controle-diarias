require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'communications_priority_check';" });
  console.log(data, error);
}
run();
