require('dotenv').config();
console.log("Service key:", process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
