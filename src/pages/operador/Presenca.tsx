import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Obra, Funcionario, Presenca } from '../../lib/types';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

export default function PresencaPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState('');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [jaRegistradoHoje, setJaRegistradoHoje] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hoje = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadObras();
  }, []);

  useEffect(() => {
    if (obraId) {
      loadFuncionariosEPresencas(obraId);
    }
  }, [obraId]);

  async function loadObras() {
    const data = await api.getObras();
    setObras(data);
  }

  async function loadFuncionariosEPresencas(selectedObraId: string) {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const funcs = await api.getFuncionariosPorObra(selectedObraId);
      setFuncionarios(funcs);

      const presencasData = await api.getPresencas(hoje, selectedObraId);
      
      if (presencasData.length > 0) {
        setJaRegistradoHoje(true);
      } else {
        setJaRegistradoHoje(false);
      }

      const presencasMap: Record<string, boolean> = {};
      
      // Inicializar todos como false primeiro
      funcs.forEach(f => {
        presencasMap[f.id] = false;
      });

      // Sobrescrever com os dados salvos
      presencasData.forEach(p => {
        if (presencasMap[p.funcionario_id] !== undefined) {
          presencasMap[p.funcionario_id] = p.presente;
        }
      });

      setPresencas(presencasMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const togglePresenca = (funcionarioId: string) => {
    if (jaRegistradoHoje) return;
    setPresencas(prev => ({
      ...prev,
      [funcionarioId]: !prev[funcionarioId]
    }));
    setSavedSuccess(false);
  };

  const handleSalvarClick = () => {
    if (jaRegistradoHoje) return;
    setShowConfirm(true);
  };

  const handleConfirmSalvar = async () => {
    setShowConfirm(false);
    if (!obraId) return;
    setSaving(true);
    
    const registrosToSave = funcionarios.map(f => ({
      funcionario_id: f.id,
      obra_id: obraId,
      data: hoje,
      presente: presencas[f.id] || false
    }));

    try {
      await api.salvarPresencas(registrosToSave);
      setSavedSuccess(true);
      setJaRegistradoHoje(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar presença');
    } finally {
      setSaving(false);
    }
  };

  const funcionariosAgrupados = funcionarios.reduce((acc, func) => {
    const funcao = func.funcao?.nome || 'Sem Função';
    if (!acc[funcao]) acc[funcao] = [];
    acc[funcao].push(func);
    return acc;
  }, {} as Record<string, Funcionario[]>);

  const funcoesOrdenadas = Object.keys(funcionariosAgrupados).sort();
  funcoesOrdenadas.forEach(funcao => {
    funcionariosAgrupados[funcao].sort((a, b) => a.nome.localeCompare(b.nome));
  });

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">Lista de Presença</h2>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <label htmlFor="obra" className="block text-sm font-medium text-gray-700 mb-2">
          1. Selecione a Obra
        </label>
        <select
          id="obra"
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
        >
          <option value="" disabled>Toque para selecionar...</option>
          {obras.map(o => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
        
        <p className="mt-3 text-sm text-gray-500">
          Data atual: <strong>{format(new Date(), 'dd/MM/yyyy')}</strong>
        </p>
      </div>

      {obraId && !loading && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-2">
            2. Marque os presentes
          </h3>
          
          {funcionarios.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
              Nenhum funcionário alocado nesta obra.
            </div>
          ) : (
            <div>
              {jaRegistradoHoje && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start">
                  <span className="text-xl mr-3">⚠️</span>
                  <div>
                    <h4 className="font-bold">Atenção</h4>
                    <p className="text-sm">A presença desta obra já foi registrada hoje.</p>
                  </div>
                </div>
              )}
              {funcoesOrdenadas.map(funcao => (
                <div key={funcao} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider pl-2">{funcao}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {funcionariosAgrupados[funcao].map(f => {
                      const isPresent = presencas[f.id] || false;
                      return (
                        <button 
                          key={f.id}
                          onClick={() => togglePresenca(f.id)}
                          disabled={jaRegistradoHoje}
                          className={`flex items-center p-4 rounded-xl text-left w-full transition-all border ${
                            isPresent 
                              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-900 shadow-sm hover:bg-gray-50'
                          } ${jaRegistradoHoje ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex-shrink-0 mr-4 text-2xl">
                            {isPresent ? '🟢' : '⚪'}
                          </div>
                          <div className="flex-1 text-lg font-medium">
                            {f.nome}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {obraId && !loading && funcionarios.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:relative sm:bg-transparent sm:border-0 sm:p-0 z-10">
          <button
            onClick={handleSalvarClick}
            disabled={saving || jaRegistradoHoje}
            className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white focus:outline-none transition-colors ${
              savedSuccess 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:bg-gray-400'
            }`}
          >
            {saving ? 'Salvando...' : savedSuccess ? 'Presença Salva!' : jaRegistradoHoje ? 'Já Registrado' : 'Salvar Presença'}
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar</h3>
            <p className="text-gray-600 mb-6">Deseja salvar a presença desta obra?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSalvar}
                className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
