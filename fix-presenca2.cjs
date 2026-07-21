const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// We previously didn't match getPresencasHoje, so we need to inject the fetch for atestados
// Let's find: `const presencasData = await api.getPresencas(selectedDate);`
code = code.replace(
  "const presencasData = await api.getPresencas(selectedDate);",
  "const [presencasData, atestados] = await Promise.all([\n        api.getPresencas(selectedDate),\n        api.getActiveAtestadosForDate(selectedDate)\n      ]);\n      const atestadosMap: Record<string, any> = {};\n      atestados.forEach((a: any) => atestadosMap[a.employee_id] = a);\n      setAtestadosAtivos(atestadosMap);"
);

// We still need to replace the WhatsApp logic
code = code.replace(
  /if \(presencas\[f\.id\]\) \{/g,
  "if (presencas[f.id] || atestadosAtivos[f.id]) {"
);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
