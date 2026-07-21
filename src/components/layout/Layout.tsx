import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, LayoutDashboard, HardHat, Briefcase, Users, FileText, LogOut, ClipboardCheck, Camera, Stethoscope } from 'lucide-react';
import { cn } from '../../lib/utils';

import { version } from '../../config/appVersion';

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.perfil !== 'ADMIN') {
    return <Navigate to="/operador/presenca" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Obras', path: '/admin/obras', icon: HardHat },
    { name: 'Funções', path: '/admin/funcoes', icon: Briefcase },
    { name: 'Funcionários', path: '/admin/funcionarios', icon: Users },
    { name: 'Presença', path: '/admin/presenca', icon: ClipboardCheck },
    { name: 'Relatórios', path: '/admin/relatorios', icon: FileText },
    { name: 'Atestados', path: '/admin/atestados', icon: Stethoscope },
    { name: 'Comunicações', path: '/admin/comunicacoes', icon: Megaphone },
    { name: 'Auditoria de Presenças', path: '/admin/auditoria', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="flex flex-col items-center justify-center py-6 px-4 border-b border-gray-200">
          <img src="/logo.png" alt="Controle de Diárias" className="h-24 w-24 object-contain mb-3" />
          <h1 className="text-lg font-bold text-gray-900 text-center leading-tight">Controle de Diárias</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
            <div className="flex-1 truncate">
              {usuario.usuario}
              <div className="text-xs text-gray-500 font-normal">Administrador</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
            Controle de Diárias<br/>
            Versão {version}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-3 md:hidden">
           <img src="/logo.png" alt="Controle de Diárias" className="h-10 w-10 object-contain" />
           <h1 className="text-xl font-bold text-gray-900 flex-1">Controle de Diárias</h1>
           <button onClick={logout} className="text-gray-500 hover:text-red-600">
             <LogOut className="h-6 w-6" />
           </button>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function OperadorLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  if (usuario.perfil === 'ADMIN' && location.pathname === '/operador') {
     return <Navigate to="/admin/dashboard" replace />;
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
}
