import re

with open('src/pages/operador/Presenca.tsx', 'r') as f:
    content = f.read()

good_str = """{actionMenuFuncId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Ações de Presença
            </h3>"""

content = re.sub(r"\{actionMenuFuncId && \(\s*<\/h3>", good_str, content)

with open('src/pages/operador/Presenca.tsx', 'w') as f:
    f.write(content)
