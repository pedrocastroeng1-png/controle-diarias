import React, { useEffect, useState, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PwaUpdateModal() {
  const { usuario } = useAuth();
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Run check on intervals (every 10 minutes)
        setInterval(() => {
          r.update();
        }, 10 * 60 * 1000);

        // Check on visibility change (returns from background)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            r.update();
          }
        });
        
        // Also we can manually expose the registration if needed for login
        // but typically the visibility change handles most cases, 
        // and we can use a global window function to trigger it.
        window.checkPwaUpdate = () => {
          r.update();
        };
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Call the check on login if the user state changes (meaning they logged in)
  useEffect(() => {
    if (usuario && window.checkPwaUpdate) {
      window.checkPwaUpdate();
    }
  }, [usuario]);

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🚀 Nova versão disponível!
          </h3>
          
          <p className="text-gray-600 mb-2">
            Uma nova versão do Controle de Diárias está disponível.
          </p>
          <p className="text-gray-600 mb-6">
            Atualize agora para utilizar as melhorias e correções mais recentes.
          </p>
          
          {/* Optional version info could go here if we extracted it, but typically we don't have it explicitly without an API or building a version JSON. We'll just keep it simple. */}
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => updateServiceWorker(true)}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
            >
              Atualizar
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
