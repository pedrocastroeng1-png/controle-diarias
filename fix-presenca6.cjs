const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

const search = "return (\n                    <button \n                      key={f.id}";
const replace = `
                  if (atestadosAtivos[f.id]) {
                    return (
                      <div key={f.id} className="flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl text-left w-full transition-all border bg-blue-50 border-blue-200 shadow-sm opacity-90 relative overflow-hidden">
                        <div className="flex items-center w-full">
                          <div className="flex-shrink-0 mr-4 h-16 w-16 bg-blue-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-2xl">🩺</span>
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-lg font-bold text-gray-900 truncate">{f.nome}</p>
                            <p className="text-sm font-medium text-gray-500 truncate">{f.funcao?.nome || 'Função não definida'}</p>
                            <p className="text-xs font-bold text-blue-700 mt-1">🩺 ATESTADO MÉDICO ({format(parseISO(atestadosAtivos[f.id].start_date), 'dd/MM/yyyy')} até {format(parseISO(atestadosAtivos[f.id].end_date), 'dd/MM/yyyy')})</p>
                          </div>
                          <div className="flex-shrink-0">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-800">🔒 Presença Bloqueada</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button 
                      key={f.id}`;

code = code.replace(search, replace);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
