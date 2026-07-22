const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Add relative z-10 to the modal container
  code = code.replace(
    /className="inline-block align-bottom bg-white rounded-2xl/g,
    'className="relative z-10 inline-block align-bottom bg-white rounded-2xl'
  );
  fs.writeFileSync(filePath, code);
}

fixFile('src/pages/admin/Communications.tsx');
fixFile('src/pages/admin/Atestados.tsx');

