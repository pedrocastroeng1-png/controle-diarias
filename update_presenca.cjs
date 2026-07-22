const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

const regex = /\{funcionarios\.map\(f => \{[\s\S]*?\}\)\}/;

const replacement = `{funcionarios.map(f => {
                  const isPresent = presencas[f.id] || false;
                  
                  const statusBadge = isPresent 
                    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 shadow-sm">🟢 Presente</span>
                    : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 shadow-sm">🔴 Falta</span>;
                  
                  if (atestadosAtivos[f.id]) {
                    return (
                      <div key={f.id} className="flex flex-col sm:flex-row items-start sm:items-center p-3.5 sm:p-4 rounded-2xl text-left w-full transition-all border bg-slate-50 border-slate-200 shadow-sm">
                        <div className="flex items-center w-full">
                          <div className="flex-shrink-0 mr-3.5 h-12 w-12 bg-white rounded-full overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
                            <span className="text-xl">🩺</span>
                          </div>
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-base sm:text-lg font-bold text-slate-800 leading-tight">{f.nome}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                <span className="text-xs font-medium text-slate-500 truncate">{f.funcao?.nome || 'Função não definida'}</span>
                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                  Atestado: {format(parseISO(atestadosAtivos[f.id].start_date), 'dd/MM')} - {format(parseISO(atestadosAtivos[f.id].end_date), 'dd/MM')}
                                </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 shadow-sm">🔒 Bloqueado</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <button 
                      key={f.id}
                      onClick={() => togglePresenca(f.id)}
                      disabled={!isAdmin && (jaRegistradoHoje || saving)}
                      className={\`flex flex-col sm:flex-row items-start sm:items-center p-3.5 sm:p-4 rounded-2xl text-left w-full transition-all border \${
                        isPresent 
                          ? 'bg-white border-green-200 shadow-sm hover:border-green-300 hover:shadow-md' 
                          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                      } \${(!isAdmin && (jaRegistradoHoje || saving)) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} relative group\`}
                    >
                      <div className="flex items-center w-full">
                        <div className={\`flex-shrink-0 mr-3.5 h-12 w-12 bg-slate-50 rounded-full overflow-hidden border shadow-sm flex items-center justify-center transition-colors \${isPresent ? 'border-green-200 ring-4 ring-green-50' : 'border-slate-200'}\`}>
                          {photoUrls[f.id] ? (
                            <img src={photoUrls[f.id]} alt={f.nome} className="h-full w-full object-cover" onError={(e) => { console.error('Failed to load image on Presenca card:', photoUrls[f.id]); e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                          ) : null}
                          <User className={\`h-6 w-6 text-slate-400 \${photoUrls[f.id] ? 'hidden' : ''}\`} />
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-base sm:text-lg font-bold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">{f.nome}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1 truncate">{f.funcao?.nome || 'Função não definida'}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {statusBadge}
                        </div>
                      </div>
                    </button>
                  );
                })}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
