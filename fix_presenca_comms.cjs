const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

code = code.replace("const [unreadComms, setUnreadComms] = useState<any[]>([]);\n", "");
code = code.replace("const [currentCommIndex, setCurrentCommIndex] = useState(0);\n", "");
code = code.replace("const [commsFinished, setCommsFinished] = useState(false);\n", "");
code = code.replace("const [readingComms, setReadingComms] = useState(true);\n", "");

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
