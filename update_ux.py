import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

# 1. State changes: add toast
state_additions = """  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  
  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };"""

content = content.replace("const [showConfirm, setShowConfirm] = useState(false);", "const [showConfirm, setShowConfirm] = useState(false);\n" + state_additions)

# Remove showSuccessDialog completely
content = content.replace("const [showSuccessDialog, setShowSuccessDialog] = useState(false);", "")

# 2. Update toggle to show bottom sheet instead of browser dialogs
# Wait, the action menu already opens `actionMenuFuncId`
# Let's style actionMenuFuncId as a bottom sheet for mobile.

action_menu_regex = re.compile(r"\{actionMenuFuncId && \([\s\S]*?Ações de Presença[\s\S]*?<\/div>\s*<\/div>\s*\)\}", re.DOTALL)

new_action_menu = """      {actionMenuFuncId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Ações de Presença
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {funcionarios.find(f => f.id === actionMenuFuncId)?.nome}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleActionChangeStatus}
                className="w-full px-4 py-4 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center gap-4 text-left"
              >
                <span className="text-2xl">🔄</span> <span className="font-medium text-lg">Alterar Status</span>
              </button>
              <button 
                onClick={handleActionReplacePhoto}
                className="w-full px-4 py-4 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center gap-4 text-left"
              >
                <span className="text-2xl">📸</span> <span className="font-medium text-lg">Substituir Foto</span>
              </button>
              <button 
                onClick={() => {
                  setFuncToDelete(actionMenuFuncId);
                  setActionMenuFuncId(null);
                }}
                className="w-full px-4 py-4 font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors flex items-center gap-4 text-left"
              >
                <span className="text-2xl">🗑️</span> <span className="font-medium text-lg">Excluir Presença</span>
              </button>
            </div>
            <button 
              onClick={() => setActionMenuFuncId(null)}
              className="mt-6 w-full px-4 py-4 text-lg font-medium text-gray-600 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}"""

content = action_menu_regex.sub(new_action_menu, content)


# 3. Employee Cards
# Replace the mapping over funcionarios
func_list_regex = re.compile(r"<div className=\"grid grid-cols-1 gap-3\">\s*\{funcionarios\.map\(f => \{[\s\S]*?\}\)\}\s*<\/div>", re.DOTALL)

new_func_list = """<div className="grid grid-cols-1 gap-4">
                {funcionarios.map(f => {
                  const isPresent = presencas[f.id] || false;
                  // Handle other fake statuses just for display? No, only Present/Absent is saved.
                  // The user requested colored badges. 
                  const statusBadge = isPresent 
                    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Presente</span>
                    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">🔴 Falta</span>;

                  return (
                    <button 
                      key={f.id}
                      onClick={() => togglePresenca(f.id)}
                      disabled={!isAdmin && (jaRegistradoHoje || saving)}
                      className={`flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl text-left w-full transition-all border ${
                        isPresent 
                          ? 'bg-white border-green-200 shadow-md shadow-green-100/50 hover:border-green-300' 
                          : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
                      } ${(!isAdmin && (jaRegistradoHoje || saving)) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} relative overflow-hidden`}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-shrink-0 mr-4 h-16 w-16 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                          {f.photo_path ? (
                            <img src={f.photo_path} alt={f.nome} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                          ) : null}
                          <User className={`h-8 w-8 text-gray-300 ${f.photo_path ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-lg font-bold text-gray-900 truncate">{f.nome}</p>
                          <p className="text-sm font-medium text-gray-500 truncate">{f.funcao?.nome || 'Função não definida'}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {statusBadge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>"""

content = func_list_regex.sub(new_func_list, content)

# Remove showSuccessDialog completely
content = re.sub(r"      \{showSuccessDialog && \([\s\S]*?<\/div>\s*<\/div>\s*\)\}", "", content)
content = re.sub(r"  const handleSuccessOk = \(\) => \{[\s\S]*?\};\n", "", content)

# Change saving success feedback
content = content.replace("setShowSuccessDialog(true);", "setSavedSuccess(true);\n      showToast('✅ Presença registrada com sucesso!', 'success');")
content = content.replace("setSavedSuccess(false);\n    setActionMenuFuncId(null);", "setSavedSuccess(false);\n    setActionMenuFuncId(null);\n    showToast('✅ Status alterado', 'success');")
content = content.replace("setFuncToDelete(null);\n      }", "setFuncToDelete(null);\n      }\n      showToast('✅ Registro excluído', 'success');")

# Add toast component at the end of the file
toast_ui = """      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );"""

content = re.sub(r"    <\/div>\s*\);\s*\}", toast_ui + "\n}", content)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
