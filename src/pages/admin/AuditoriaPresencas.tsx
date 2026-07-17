import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Funcionario, Presenca } from '../../lib/types';
import { Search, Loader2, Camera, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

export default function AuditoriaPresencas() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPresenca, setSelectedPresenca] = useState<Presenca | null>(null);
  
  const [registrationPhotoUrl, setRegistrationPhotoUrl] = useState<string>('');
  const [attendancePhotoUrl, setAttendancePhotoUrl] = useState<string>('');

  useEffect(() => {
    loadFuncionarios();
  }, []);

  async function loadFuncionarios() {
    try {
      const data = await api.getFuncionarios('todos');
      setFuncionarios(data);
      setFilteredFuncionarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInitial(false);
    }
  }

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredFuncionarios(
      funcionarios.filter(f => f.nome.toLowerCase().includes(term))
    );
  }, [searchTerm, funcionarios]);

  async function handleSelectFuncionario(f: Funcionario) {
    setSelectedFuncionario(f);
    setSearchTerm(f.nome);
    setLoading(true);
    setPresencas([]);
    setRegistrationPhotoUrl('');
    
    try {
      // Carrega foto de registro se houver
      if (f.photo_path) {
        const url = await api.getPhotoUrl('employee-photos', f.photo_path);
        setRegistrationPhotoUrl(url);
      }
      
      const history = await api.getAuditoriaPresencas(f.id);
      setPresencas(history);
    } catch (err) {
      console.error('Erro ao carregar auditoria', err);
    } finally {
      setLoading(false);
    }
  }

  async function openModal(presenca: Presenca) {
    console.log('--- DEBUG AUDITORIA ---');
    console.log('Opening modal for presenca:', presenca);
    console.log('Photo path:', presenca.photo_path);
    
    setSelectedPresenca(presenca);
    setAttendancePhotoUrl('');
    
    try {
      if (presenca.photo_path) {
         console.log('Generating signed URL for attendance-photos:', presenca.photo_path);
         const url = await api.getPhotoUrl('attendance-photos', presenca.photo_path);
         console.log('Generated Signed URL:', url);
         setAttendancePhotoUrl(url);
      } else {
         console.log('No photo_path found for this attendance record.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar foto de presença', err);
      console.error('Error details:', err.message || err);
    } finally {
      setModalOpen(true);
    }
  }
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoria de Presenças</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verifique evidências fotográficas de presenças registradas nos últimos 15 dias.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative z-20">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Funcionário</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
            placeholder="Digite o nome do funcionário..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedFuncionario && e.target.value !== selectedFuncionario.nome) {
                setSelectedFuncionario(null);
                setPresencas([]);
                setRegistrationPhotoUrl('');
              }
            }}
          />
          
          {searchTerm && !selectedFuncionario && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {filteredFuncionarios.length > 0 ? (
                <ul className="py-1">
                  {filteredFuncionarios.map(f => (
                    <li
                      key={f.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                      onClick={() => handleSelectFuncionario(f)}
                    >
                      {f.nome}
                      <span className="ml-2 text-xs text-gray-400">({f.obra?.nome})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">Nenhum funcionário encontrado.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {selectedFuncionario && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="mx-auto h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-4 flex items-center justify-center">
                {registrationPhotoUrl ? (
                  <img src={registrationPhotoUrl} alt={selectedFuncionario.nome} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{selectedFuncionario.nome}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedFuncionario.funcao?.nome}</p>
              
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                {selectedFuncionario.obra?.nome}
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedFuncionario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedFuncionario.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-blue-500" /> Histórico de Presenças (Com Foto)
                </h3>
              </div>
              
              {presencas.length > 0 ? (
                <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {presencas.map(p => {
                    const [ano, mes, dia] = p.data.split('-');
                    return (
                      <li key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-4">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-gray-400" /> {dia}/{mes}/{ano}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                {/* Simulated Operator logic since operator isn't explicitly in the schema */}
                                Operador Registrou
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openModal(p)}
                            className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Ver Foto
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma presença com evidência fotográfica nos últimos 15 dias.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && selectedPresenca && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4" id="modal-title">
                      Auditoria de Presença: {selectedFuncionario?.nome}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Registration Photo */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Foto de Cadastro</span>
                        <div className="h-64 w-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {registrationPhotoUrl ? (
                            <img src={registrationPhotoUrl} alt="Cadastro" className="h-full w-full object-cover" onError={(e) => {
                              console.error('Failed to load reg image from URL:', registrationPhotoUrl);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
                              e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-xs text-red-500 mt-2 text-center p-2">Erro ao carregar imagem</span>');
                            }} />
                          ) : (
                            <User className="h-24 w-24 text-gray-300" />
                          )}
                        </div>
                      </div>
                      
                      {/* Attendance Photo */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Foto da Presença</span>
                        <div className="h-64 w-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {attendancePhotoUrl ? (
                            <img src={attendancePhotoUrl} alt="Presença" className="h-full w-full object-cover" onError={(e) => {
                              console.error('Failed to load image from URL:', attendancePhotoUrl);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
                              e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-xs text-red-500 mt-2 text-center p-2">Erro ao carregar imagem</span>');
                            }} />
                          ) : (
                            <span className="text-gray-400 text-sm font-medium flex flex-col items-center">
                              <User className="h-12 w-12 text-gray-300 mb-2" />
                              Sem Foto
                            </span>
                          )}
                        </div>
                        <div className="mt-6 text-center bg-gray-50 p-4 rounded-lg w-full">
                           <p className="text-sm font-medium text-gray-900">
                             Data: {selectedPresenca.data.split('-').reverse().join('/')}
                           </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setModalOpen(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
