import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

# Update funcToDelete modal
delete_regex = re.compile(r"\{funcToDelete && \([\s\S]*?Excluir Presença[\s\S]*?<\/div>\s*<\/div>\s*\)\}", re.DOTALL)
new_delete = """{funcToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center text-red-600">Excluir Presença</h3>
            <p className="text-gray-600 mb-6 text-center text-lg">
              Are you sure you want to delete this attendance record for <strong>{funcionarios.find(f => f.id === funcToDelete)?.nome}</strong>?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setFuncToDelete(null)}
                className="w-full sm:w-auto px-6 py-3 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteFunc}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 order-1 sm:order-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}"""
content = delete_regex.sub(new_delete, content)

# Update showConfirm modal
confirm_regex = re.compile(r"\{showConfirm && \([\s\S]*?Confirmar[\s\S]*?<\/div>\s*<\/div>\s*\)\}", re.DOTALL)
new_confirm = """{showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirmar</h3>
            <p className="text-gray-600 mb-6 text-center text-lg">Deseja salvar a lista de presença?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full sm:w-auto px-6 py-3 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSalvar}
                className="w-full sm:w-auto px-6 py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors order-1 sm:order-2"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}"""
content = confirm_regex.sub(new_confirm, content)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
