const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

code = code.replace(
  /<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={\(\) => setModalOpen\(false\)}><\/div>\s*<div className="relative z-10 bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl w-full">\s*<div className="bg-white px-4/g,
  '<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setReadsModalOpen(false)}></div>\n            <div className="relative z-10 bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full">\n              <div className="bg-white px-4'
);

fs.writeFileSync('src/pages/admin/Communications.tsx', code);
