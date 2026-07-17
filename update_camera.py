import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

# Add states for the new camera flow
state_additions = """  const [previewPhoto, setPreviewPhoto] = useState<{file: File, url: string} | null>(null);"""
content = content.replace("const [cameraModalFuncId, setCameraModalFuncId] = useState<string | null>(null);", "const [cameraModalFuncId, setCameraModalFuncId] = useState<string | null>(null);\n" + state_additions)


camera_modal_regex = re.compile(r"\{cameraModalFuncId && \([\s\S]*?Ações de Presença", re.DOTALL)

new_camera_modal = """{cameraModalFuncId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
             <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Registrar Foto</h3>
             
             {!previewPhoto ? (
               <>
                 <div className="mb-6">
                    <span className="text-sm font-medium text-gray-700 block mb-2 text-center">Foto Atual</span>
                    <div className="h-32 w-32 mx-auto rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-md">
                      {employeeRegistrationPhoto ? (
                        <img src={employeeRegistrationPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <p className="text-center font-bold mt-3 text-lg text-gray-900">{funcionarios.find(f => f.id === cameraModalFuncId)?.nome}</p>
                 </div>
                 <label className="flex items-center justify-center w-full cursor-pointer px-4 py-4 bg-gray-900 text-white rounded-2xl text-center font-medium hover:bg-gray-800 transition shadow-md">
                    <Camera className="w-6 h-6 mr-3" />
                    Abrir Câmera
                    <input 
                       type="file" 
                       accept="image/*" 
                       capture="environment" 
                       className="hidden" 
                       onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPreviewPhoto({
                            file,
                            url: URL.createObjectURL(file)
                          });
                        }
                      }} 
                     />
                 </label>
                 <button 
                    onClick={() => {
                      setCameraModalFuncId(null);
                      setPreviewPhoto(null);
                    }}
                   className="mt-4 w-full px-4 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition"
                 >
                   Cancelar
                 </button>
               </>
             ) : (
               <>
                 <div className="mb-6">
                    <span className="text-sm font-medium text-gray-700 block mb-2 text-center">Nova Foto</span>
                    <div className="h-48 w-48 mx-auto rounded-3xl overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-md">
                      <img src={previewPhoto.url} className="w-full h-full object-cover" />
                    </div>
                 </div>
                 <button 
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      
                      try {
                        // If it's a replacement (already saved), update immediately
                        if (isAdmin && savedRecords[cameraModalFuncId]) {
                           const now = new Date().toISOString();
                           const photo_path = await api.uploadAttendancePhoto(previewPhoto.file, cameraModalFuncId);
                           await api.salvarPresencas([{
                              funcionario_id: cameraModalFuncId,
                              data: selectedDate,
                              presente: true,
                              photo_path,
                              photo_taken_at: now,
                              photo_taken_by: usuario?.id || null
                           }]);
                           showToast('✅ Foto substituída com sucesso!', 'success');
                        } else {
                           // Standard flow: just save to state for bulk submission
                           setCapturedFotos(prev => ({ ...prev, [cameraModalFuncId]: previewPhoto.file }));
                           setPresencas(prev => ({ ...prev, [cameraModalFuncId]: true }));
                           setSavedSuccess(false);
                        }
                        
                        setCameraModalFuncId(null);
                        setPreviewPhoto(null);
                      } catch (err: any) {
                        setErro(err.message || 'Erro ao processar foto');
                        showToast('❌ Erro ao processar foto', 'error');
                      } finally {
                        setSaving(false);
                      }
                    }}
                   className="flex justify-center items-center w-full px-4 py-4 bg-green-600 text-white rounded-2xl text-center font-medium hover:bg-green-700 transition shadow-md disabled:opacity-70"
                 >
                   {saving ? 'Salvando...' : 'Confirmar e Salvar'}
                 </button>
                 <button 
                    disabled={saving}
                    onClick={() => setPreviewPhoto(null)}
                   className="mt-4 w-full px-4 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition"
                 >
                   Tirar Outra Foto
                 </button>
               </>
             )}
          </div>
        </div>
      )}

      {actionMenuFuncId && ("""

content = camera_modal_regex.sub(new_camera_modal, content)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
