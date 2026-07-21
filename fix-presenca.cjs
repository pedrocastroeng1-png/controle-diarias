const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// We need to add state for Atestados
code = code.replace(
  "const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);",
  "const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);\n  const [atestadosAtivos, setAtestadosAtivos] = useState<Record<string, any>>({});"
);

// We need to modify loadData to fetch atestados for selectedDate
const loadDataRegex = /async function loadData\(\) \{[\s\S]*?setFuncionarios\(ativos\);[\s\S]*?const logs = await api\.getPresencasHoje/;

code = code.replace(
  "const logs = await api.getPresencasHoje(isAdmin ? 'all' : usuario.obra_id, selectedDate);",
  "const [logs, atestados] = await Promise.all([\n        api.getPresencasHoje(isAdmin ? 'all' : usuario.obra_id, selectedDate),\n        api.getActiveAtestadosForDate(selectedDate)\n      ]);\n      \n      const atestadosMap: Record<string, any> = {};\n      atestados.forEach((a: any) => atestadosMap[a.employee_id] = a);\n      setAtestadosAtivos(atestadosMap);"
);

// Now in the render logic for the list of employees:
// Instead of showing the action buttons, we show "🔒 Atestado Médico"

const cardInnerRegex = /(<div className="flex flex-col sm:flex-row sm:items-center justify-between">)[\s\S]*?(<div className="mt-4 flex flex-col sm:flex-row gap-2">)/;

// Let's replace by injecting atestado logic
code = code.replace(
  /<div className="mt-4 flex flex-col sm:flex-row gap-2">/g,
  `{atestadosAtivos[f.id] ? (
                  <div className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-center justify-center font-medium border border-blue-100 shadow-sm">
                    <span className="mr-2">🩺</span>
                    <div>
                      <div className="text-sm font-bold">ATESTADO MÉDICO</div>
                      <div className="text-xs opacity-75">{format(parseISO(atestadosAtivos[f.id].start_date), 'dd/MM/yyyy')} até {format(parseISO(atestadosAtivos[f.id].end_date), 'dd/MM/yyyy')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">`
);

// We need to close the ternary where the button group ends.
// Let's find the end of the button group.
// It ends with:
//                      </button>
//                    )}
//                  </div>
//                </div>

code = code.replace(
  /                  <\/div>\n                <\/div>\n              <\/li>/g,
  `                  </div>\n                )}\n                </div>\n              </li>`
);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
