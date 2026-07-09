const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'operador', 'Presenca.tsx');
let content = fs.readFileSync(file, 'utf8');

// We need to use useAuth to get the profile
if (!content.includes('useAuth')) {
    content = content.replace(/import { format } from 'date-fns';/, "import { format } from 'date-fns';\nimport { useAuth } from '../../contexts/AuthContext';");
    content = content.replace(/export default function PresencaPage\(\) \{/, "export default function PresencaPage() {\n  const { usuario } = useAuth();\n  const isAdmin = usuario?.perfil === 'ADMIN';");
}

// Add state for selectedDate
content = content.replace(/const hoje = format\(new Date\(\), 'yyyy-MM-dd'\);/, "const hoje = format(new Date(), 'yyyy-MM-dd');\n  const [selectedDate, setSelectedDate] = useState(hoje);");

// modify loadFuncionariosEPresencas to use selectedDate and not block admin
content = content.replace(/const presencasData = await api\.getPresencas\(hoje\);/, "const presencasData = await api.getPresencas(selectedDate);");
content = content.replace(/if \(presencasData\.length > 0\) \{\s*setJaRegistradoHoje\(true\);\s*\} else \{\s*setJaRegistradoHoje\(false\);\s*\}/, "if (presencasData.length > 0) {\n        setJaRegistradoHoje(!isAdmin);\n      } else {\n        setJaRegistradoHoje(false);\n      }");

// allow admin to change date
content = content.replace(/Data atual: <strong>\{format\(new Date\(\), 'dd\/MM\/yyyy'\)\}<\/strong>/, 
`{isAdmin ? (
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">Data:</label>
              <input 
                type="date" 
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          ) : (
            <>Data atual: <strong>{format(new Date(), 'dd/MM/yyyy')}</strong></>
          )}`);

// Reload when selectedDate changes
content = content.replace(/loadFuncionariosEPresencas\(\);\n  \}, \[\]\);/, "loadFuncionariosEPresencas();\n  }, [selectedDate]);");

// use selectedDate for saving
content = content.replace(/data: hoje,/g, "data: selectedDate,");

// jaRegistradoHoje disabled condition
content = content.replace(/disabled=\{jaRegistradoHoje \|\| saving\}/g, "disabled={jaRegistradoHoje || saving}");
content = content.replace(/disabled=\{\(jaRegistradoHoje \|\| saving\)\}/g, "disabled={(jaRegistradoHoje || saving)}");
content = content.replace(/disabled=\{saving \|\| jaRegistradoHoje\}/g, "disabled={saving || jaRegistradoHoje}");

fs.writeFileSync(file, content);
