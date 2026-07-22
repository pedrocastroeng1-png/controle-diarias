const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

// Ensure CommunicationViewer and api are imported
if (!code.includes('CommunicationViewer')) {
  code = "import { CommunicationViewer } from '../CommunicationViewer';\n" + code;
}
if (!code.includes("import { api }")) {
  code = "import { api } from '../../lib/api';\n" + code;
}
if (!code.includes("useState") && !code.includes("useEffect")) {
  code = code.replace("import React", "import React, { useState, useEffect }");
} else if (!code.includes("useState") && code.includes("import React")) {
  code = code.replace("import React, {", "import React, { useState,");
} else if (!code.includes("useEffect") && code.includes("import React")) {
  code = code.replace("import React, {", "import React, { useEffect,");
}

const operadorLayoutFunction = `
export function OperadorLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [unreadComms, setUnreadComms] = useState<any[]>([]);
  const [loadingComms, setLoadingComms] = useState(true);

  useEffect(() => {
    if (usuario && usuario.perfil === 'OPERADOR') {
      api.getUnreadCommunications(usuario.id).then(comms => {
        setUnreadComms(comms);
        setLoadingComms(false);
      }).catch(err => {
        console.error(err);
        setLoadingComms(false);
      });
    } else {
      setLoadingComms(false);
    }
  }, [usuario]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
    
  if (usuario.perfil === 'ADMIN' && location.pathname === '/operador') {
     return <Navigate to="/admin/dashboard" replace />;
  }

  if (loadingComms) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (unreadComms.length > 0) {
    return <CommunicationViewer communications={unreadComms} onComplete={() => setUnreadComms([])} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <img src="/logo.png" alt="Controle de Diárias" className="h-10 w-10 object-contain" />
                <h1 className="text-lg font-bold text-gray-900 leading-tight hidden sm:block">Controle de Diárias</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/operador/presenca"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <ClipboardCheck className="mr-2 h-5 w-5 text-blue-600" />
                  Presença
                </Link>
              </div>
            </div>
            <div className="flex items-center">
               <div className="mr-4 text-sm text-gray-600 hidden sm:block">
                 Olá, <span className="font-semibold">{usuario.usuario}</span>
               </div>
               <button
                 onClick={logout}
                 className="flex items-center text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
               >
                 <LogOut className="h-5 w-5 mr-1" />
                 Sair
               </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-8 py-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Versão {version}
        </footer>
      </main>
    </div>
  );
}`;

// Need to replace the existing OperadorLayout
code = code.replace(/export function OperadorLayout\(\) \{[\s\S]*$/, operadorLayoutFunction);
fs.writeFileSync('src/components/layout/Layout.tsx', code);
