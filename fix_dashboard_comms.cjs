const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// We need to fetch active communications
const loadDataRegex = /const atestados = await api\.getActiveAtestadosForDate\(hoje\);\n\s*setAtestadosAtivos\(atestados\.length\);/;
const loadDataReplace = `const atestados = await api.getActiveAtestadosForDate(hoje);
      setAtestadosAtivos(atestados.length);
      const comms = await api.getCommunications();
      const activeComms = comms.filter(c => c.is_active);
      setCommsAtivos(activeComms.length);`;

code = code.replace(loadDataRegex, loadDataReplace);

// State
code = code.replace(
  "const [atestadosAtivos, setAtestadosAtivos] = useState(0);",
  "const [atestadosAtivos, setAtestadosAtivos] = useState(0);\n  const [commsAtivos, setCommsAtivos] = useState(0);"
);

// Imports
if (!code.includes('Megaphone')) {
  code = code.replace("Stethoscope", "Stethoscope, Megaphone");
}

// Widget
const widgetHtml = `
        <Link to="/admin/comunicacoes" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Comunicações Ativas</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{commsAtivos}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Link>`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">\n/, 
  `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">\n${widgetHtml}\n`);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
