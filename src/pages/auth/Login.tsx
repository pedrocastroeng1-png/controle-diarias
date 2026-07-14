import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { APP_VERSION } from '../../config/version';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    
    const success = await login(usuario, senha);
    
    if (success) {
      const userStr = localStorage.getItem('@diarias:usuario');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.perfil === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/operador/presenca');
        }
      }
    } else {
      setErro('Usuário ou senha inválidos.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-12 px-8 sm:px-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] border border-slate-100">
          
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-3">
              <img src={logo} alt="Controle de Diárias" className="h-[72px] w-[72px] object-contain" />
            </div>
            <h2 className="text-[40px] leading-tight font-bold text-[#0F172A] tracking-tight">
              Controle de Diárias
            </h2>
            <p className="mt-2 text-[16px] text-slate-500 font-medium">
              Gestão de Diárias para Construção Civil
            </p>
            <p className="mt-2 text-[12px] text-slate-400 font-medium">
              Versão {APP_VERSION}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="usuario" className="block text-[14px] font-semibold text-slate-700">
                Usuário
              </label>
              <div className="mt-2">
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-[15px] transition-all duration-200 bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-[14px] font-semibold text-slate-700">
                Senha
              </label>
              <div className="mt-2">
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-[15px] transition-all duration-200 bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {erro && (
              <div className="text-[14px] text-red-600 bg-red-50/80 border border-red-100 p-4 rounded-xl flex items-center shadow-sm">
                <svg className="w-5 h-5 mr-2.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{erro}</span>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_12px_rgb(37,99,235,0.2)] text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 h-[52px] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
