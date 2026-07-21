const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');
code = code.replace(/  },,/g, '  },'); // Fix double commas
// Let's actually find the function before Atestados:
// It was getDashboardStats
code = code.replace(/    };\n  },\n  \/\/ Atestados/g, '    };\n  },\n  // Atestados');
// Let's just fix the missing comma manually
code = code.replace(/    };\n  }\n  \/\/ Atestados/g, '    };\n  },\n  // Atestados');
fs.writeFileSync('src/lib/api.ts', code);
