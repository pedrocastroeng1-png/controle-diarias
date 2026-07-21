const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// Undo the bad regex
code = code.replace(/if \(presencas\[f\.id\] \|\| atestadosAtivos\[f\.id\]\) \{/g, "if (presencas[f.id]) {");

// Manually fix handleShareWhatsApp
const whatsappStart = code.indexOf('const handleShareWhatsApp = () => {');
const whatsappEnd = code.indexOf('// Format Date', whatsappStart);
let whatsappCode = code.substring(whatsappStart, whatsappEnd);
whatsappCode = whatsappCode.replace(/if \(presencas\[f\.id\]\) \{/g, "if (presencas[f.id] || atestadosAtivos[f.id]) {");

code = code.substring(0, whatsappStart) + whatsappCode + code.substring(whatsappEnd);

// Also we need to ignore atestado employees when validating/saving
// handleSave loops through `funcionarios`. We should just filter out employees that are locked before saving.
// Or we can just let it save `presente: false` for them? No, we shouldn't create a presenca record for them, or if we do, it shouldn't fail validation.
// In handleSave:
// const funcsToSave = funcionarios.filter(f => !atestadosAtivos[f.id]);
// Let's patch handleSave to only process active employees that are NOT on medical leave.
// Actually, it's easier to just skip them in the loop.
const saveStart = code.indexOf('for (const f of funcionarios) {');
code = code.substring(0, saveStart) + "for (const f of funcionarios) {\n        if (atestadosAtivos[f.id]) continue;\n" + code.substring(saveStart + 31);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
