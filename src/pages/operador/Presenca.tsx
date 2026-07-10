import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Funcionario } from '../../lib/types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function PresencaPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === 'ADMIN';
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erro, setErro] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [jaRegistradoHoje, setJaRegistradoHoje] = useState(false);

  const hoje = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(hoje);

  useEffect(() => {
    loadFuncionariosEPresencas();
  }, [selectedDate]);

  async function loadFuncionariosEPresencas() {
    setLoading(true);
    setSavedSuccess(false);
    setErro('');

    let funcs: Funcionario[] = [];
    try {
      funcs = await api.getFuncionarios();
      setFuncionarios(funcs);
    } catch (error) {
      setErro('Ocorreu um erro ao carregar a lista de funcionários.');
      setLoading(false);
      return;
    }

    try {
      const presencasData = await api.getPresencas(selectedDate);
      
      if (presencasData.length > 0) {
        setJaRegistradoHoje(!isAdmin);
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
      // Ignore presence load error, initialize with false
      const presencasMap: Record<string, boolean> = {};
      funcs.forEach(f => {
        presencasMap[f.id] = false;
      });
      setPresencas(presencasMap);
      setJaRegistradoHoje(false);
    } finally {
      setLoading(false);
    }
  }

  const togglePresenca = (funcionarioId: string) => {
    if (jaRegistradoHoje || saving) return;
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
    setSaving(true);
    
    const registrosToSave = funcionarios.map(f => ({
      funcionario_id: f.id,
      obra_id: f.obra_id,
      data: selectedDate,
      presente: presencas[f.id] || false
    }));

    try {
      await api.salvarPresencas(registrosToSave);
      setShowSuccessDialog(true);
    } catch (error) {
      setErro('Ocorreu um erro ao salvar os dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessDialog(false);
    loadFuncionariosEPresencas();
  };

  const handleShareWhatsApp = () => {
    try {
      let totalPresentes = 0;
      let totalFaltas = 0;
      let totalFuncionarios = funcionarios.length;

      // Group by Obra
      const grouped: Record<string, { presentes: string[], faltas: string[], totalFuncs: number }> = {};

      // Ensure consistent sorting for employees inside the groups
      const sortedFuncionarios = [...funcionarios].sort((a, b) => a.nome.localeCompare(b.nome));

      sortedFuncionarios.forEach(f => {
        const obraName = f.obra?.nome || 'Sem Obra';
        if (!grouped[obraName]) {
          grouped[obraName] = { presentes: [], faltas: [], totalFuncs: 0 };
        }
        
        grouped[obraName].totalFuncs++;
        
        if (presencas[f.id]) {
          grouped[obraName].presentes.push(f.nome);
          totalPresentes++;
        } else {
          grouped[obraName].faltas.push(f.nome);
          totalFaltas++;
        }
      });

      // Format Date
      const [ano, mes, dia] = selectedDate.split('-');
      const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia));
      const dataFormatada = format(dataObj, 'dd/MM/yyyy');
      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const diaSemana = diasSemana[dataObj.getDay()];

      const agora = new Date();
      const horaFormatada = format(agora, 'HH:mm');
      const hora = agora.getHours();

      let saudacao = '🌙 Boa noite!';
      if (hora < 12) saudacao = '☀️ Bom dia!';
      else if (hora < 18) saudacao = '🌤 Boa tarde!';

      let message = `${saudacao}\nSegue abaixo o controle de diárias referente ao dia de hoje.\n\n`;
      message += `📋 *CONTROLE DE DIÁRIAS*\n📅 *${diaSemana}, ${dataFormatada}*\n══════════════════════════════\n\n`;

      // Sort obras alphabetically
      const sortedObras = Object.keys(grouped).sort();

      sortedObras.forEach(obra => {
        const group = grouped[obra];
        if (group.totalFuncs === 0) return;

        message += `🏗 *OBRA: ${obra}*\n`;
        message += `👷 Funcionários: ${group.totalFuncs}\n`;
        message += `✅ Presentes: ${group.presentes.length}\n`;
        message += `❌ Faltaram: ${group.faltas.length}\n`;
        message += `──────────────────────────────\n`;
        
        group.presentes.forEach(nome => {
          message += `✅ ${nome}\n`;
        });
        
        group.faltas.forEach(nome => {
          message += `❌ ${nome}\n`;
        });
        
        message += `\n══════════════════════════════\n\n`;
      });

      const percPresentes = totalFuncionarios > 0 ? Math.round((totalPresentes / totalFuncionarios) * 100) : 0;
      const percFaltas = totalFuncionarios > 0 ? Math.round((totalFaltas / totalFuncionarios) * 100) : 0;

      message += `📊 *RESUMO GERAL*\n`;
      message += `👷 Total de Funcionários: ${totalFuncionarios}\n`;
      message += `✅ Presentes: ${totalPresentes} (${percPresentes}%)\n`;
      message += `❌ Faltaram: ${totalFaltas} (${percFaltas}%)\n`;
      message += `══════════════════════════════\n\n`;
      
      const userName = usuario?.usuario || 'Usuário';
      message += `🕒 Registrado às: ${horaFormatada}\n`;
      message += `👤 Operador: ${userName}\n\n`;
      
      message += `📲 Gerado automaticamente pelo sistema\n*Controle de Diárias*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
      
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        setErro('Não foi possível abrir o WhatsApp. Seu dispositivo não suporta compartilhamento via WhatsApp.');
      }
    } catch (err) {
      setErro('Não foi possível abrir o WhatsApp.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {erro && (<div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{erro}</div>)}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lista de Presença</h2>
        <p className="text-sm text-gray-500">
          {isAdmin ? (
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
          )}
        </p>
      </div>

      {!loading && (
        <div className="mb-8">
          {funcionarios.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
              Nenhum funcionário cadastrado.
            </div>
          ) : (
            <div>
              {jaRegistradoHoje && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start">
                  <span className="text-xl mr-3">⚠️</span>
                  <div>
                    <h4 className="font-bold">Atenção</h4>
                    <p className="text-sm">A presença já foi registrada.</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {funcionarios.map(f => {
                  const isPresent = presencas[f.id] || false;
                  return (
                    <button 
                      key={f.id}
                      onClick={() => togglePresenca(f.id)}
                      disabled={jaRegistradoHoje || saving}
                      className={`flex items-center p-4 rounded-xl text-left w-full transition-all border ${
                        isPresent 
                          ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-900 shadow-sm hover:bg-gray-50'
                      } ${(jaRegistradoHoje || saving) ? 'opacity-70 cursor-not-allowed' : ''}`}
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
          )}
        </div>
      )}

      {!loading && funcionarios.length > 0 && (
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
            <p className="text-gray-600 mb-6">Deseja salvar a lista de presença?</p>
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

      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Presença registrada com sucesso!</h3>
            <p className="text-gray-600 mb-6">A presença foi registrada com sucesso.<br/>O que deseja fazer agora?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSuccessOk}
                className="w-full px-4 py-3 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>✅</span> Fechar
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className="w-full px-4 py-3 font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>🟢</span> Compartilhar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
