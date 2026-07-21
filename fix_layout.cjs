const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

if (!code.includes('Megaphone')) {
  code = code.replace("import { LayoutDashboard", "import { Megaphone, LayoutDashboard");
}

code = code.replace(
  "{ name: 'Atestados', path: '/admin/atestados', icon: Stethoscope },",
  "{ name: 'Atestados', path: '/admin/atestados', icon: Stethoscope },\n    { name: 'Comunicações', path: '/admin/comunicacoes', icon: Megaphone },"
);

fs.writeFileSync('src/components/layout/Layout.tsx', code);
