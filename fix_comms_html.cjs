const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Communications.tsx', 'utf8');

code = code.replace(
  '<div className="sm:col-span-2">\n                        <div className="flex items-center mt-4">\n\n                      <input',
  '<div className="flex items-center mt-4">\n\n                      <input'
);

// I need to make sure I don't leave an unclosed div at the end of the form.
// Let's check where the extra div is closed? It is not closed, that's why there is an error.
fs.writeFileSync('src/pages/admin/Communications.tsx', code);
