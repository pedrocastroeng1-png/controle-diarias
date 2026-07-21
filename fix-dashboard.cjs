const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// Insert Atestados in Dashboard
code = code.replace("import { Users, HardHat, Building2, ClipboardCheck, TrendingUp, AlertCircle, Clock } from 'lucide-react';",
"import { Users, HardHat, Building2, ClipboardCheck, TrendingUp, AlertCircle, Clock, Stethoscope } from 'lucide-react';\nimport { Link } from 'react-router-dom';");

// We can just fetch atestados in Dashboard since we need to know how many are active today
code = code.replace("const [loading, setLoading] = useState(true);",
"const [loading, setLoading] = useState(true);\n  const [atestadosAtivos, setAtestadosAtivos] = useState(0);");

code = code.replace("const data = await api.getDashboardStats();", 
"const data = await api.getDashboardStats();\n      const hoje = new Date().toISOString().split('T')[0];\n      const atestados = await api.getActiveAtestadosForDate(hoje);\n      setAtestadosAtivos(atestados.length);");

// Let's add a widget before `Presentes Hoje` or in the first grid
const widgetHtml = `
        <Link to="/admin/atestados" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Atestados Ativos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{atestadosAtivos}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <Stethoscope className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Link>`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">/,
`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">\n${widgetHtml}`);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
