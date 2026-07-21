const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// Render logic for the list of employees:
// Replace the button group with the locked UI
const buttonGroupRegex = /(<div className="mt-4 flex flex-col sm:flex-row gap-2">)/;

code = code.replace(
  buttonGroupRegex,
  `{atestadosAtivos[f.id] ? (
                  <div className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-center justify-center font-medium border border-blue-100 shadow-sm w-full">
                    <span className="mr-2 text-xl">🩺</span>
                    <div>
                      <div className="text-sm font-bold">ATESTADO MÉDICO</div>
                      <div className="text-xs opacity-75">{format(parseISO(atestadosAtivos[f.id].start_date), 'dd/MM/yyyy')} até {format(parseISO(atestadosAtivos[f.id].end_date), 'dd/MM/yyyy')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">`
);

// We need to close the ternary where the button group ends.
// In the original file:
//                      </button>
//                    )}
//                  </div>
//                </div>
//              </li>

code = code.replace(
  /                  <\/div>\n                <\/div>\n              <\/li>/g,
  `                  </div>\n                )}\n                </div>\n              </li>`
);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
