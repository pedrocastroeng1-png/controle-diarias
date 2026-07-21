const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// Fix the top of the file
code = code.substring(code.indexOf('import { api }'));
code = "import React, { useState, useEffect } from 'react';\n" + code;

const search = "const registrosToSave = await Promise.all(funcionarios.map(async (f) => {";
const repl = "const registrosToSave = await Promise.all(funcionarios.filter(f => !atestadosAtivos[f.id]).map(async (f) => {";
code = code.replace(search, repl);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
