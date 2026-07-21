const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

// Replace all }, back to }
code = code.replace(/},/g, '}');

// Now we have the file with NO commas after closing brackets.
// We need to add commas after method definitions in the `const api = {` object.
// We can use a regex to find all methods and add a comma at the end of them.
// A method looks like:
//   methodName: async (...args): Promise<Type> => {
//     ...
//   }
// So we can find `  }\n` and replace with `  },\n` for methods that are inside `export const api = {`.
// Or, we can just replace `\n  }\n` with `\n  },\n` everywhere.
code = code.replace(/\n  }\n/g, '\n  },\n');

// There might be some internal blocks like if () { ... } that were at 2 spaces? No, internal blocks are usually 4 spaces indented.
// E.g., `    }\n`.

fs.writeFileSync('src/lib/api.ts', code);
