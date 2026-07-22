require('dotenv').config();
async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const json = await res.json();
  const fs = require('fs');
  fs.writeFileSync('openapi.json', JSON.stringify(json, null, 2));
}
run();
