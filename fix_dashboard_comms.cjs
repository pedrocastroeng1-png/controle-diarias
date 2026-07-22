const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

code = code.replace(
  "import { HardHat, Users, CheckCircle, XCircle, DollarSign, ArrowRight, Activity, Calendar } from 'lucide-react';",
  "import { HardHat, Users, CheckCircle, XCircle, DollarSign, ArrowRight, Activity, Calendar, Megaphone, CheckCircle2, EyeOff } from 'lucide-react';"
);

// State vars
code = code.replace(
  "const [valorTotalHoje, setValorTotalHoje] = useState(0);",
  "const [valorTotalHoje, setValorTotalHoje] = useState(0);\n  const [totalComms, setTotalComms] = useState(0);\n  const [readComms, setReadComms] = useState(0);\n  const [unreadComms, setUnreadComms] = useState(0);"
);

// set data
code = code.replace(
  "setValorTotalHoje(stats.valorTotalHoje);",
  "setValorTotalHoje(stats.valorTotalHoje);\n        setTotalComms(stats.totalComms);\n        setReadComms(stats.readComms);\n        setUnreadComms(stats.unreadComms);"
);

// UI cards
const htmlNew = `
        <div className="md:col-span-12 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div className="space-y-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Comunicações</h3>
             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Enviadas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '...' : totalComms}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50">
                    <Megaphone className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
             </div>
           </div>
           <div className="space-y-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider opacity-0 hidden sm:block">Leituras</h3>
             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Confirmações de Leitura</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '...' : readComms}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
             </div>
           </div>
           <div className="space-y-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider opacity-0 hidden sm:block">Faltam Ler</h3>
             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Não Lidas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '...' : unreadComms}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-50">
                    <EyeOff className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
`;
code = code.replace("</div>\n            \n      <div className=\"text-center pt-8\">", htmlNew + "\n            \n      <div className=\"text-center pt-8\">");

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
