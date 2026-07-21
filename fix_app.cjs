const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import Atestados from './pages/admin/Atestados';",
  "import Atestados from './pages/admin/Atestados';\nimport Communications from './pages/admin/Communications';"
);

code = code.replace(
  '<Route path="atestados" element={<Atestados />} />',
  '<Route path="atestados" element={<Atestados />} />\n              <Route path="comunicacoes" element={<Communications />} />'
);

fs.writeFileSync('src/App.tsx', code);
