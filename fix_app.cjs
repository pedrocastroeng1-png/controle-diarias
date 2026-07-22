const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { AppUpdater } from './components/AppUpdater';", "import { AppUpdater } from './components/AppUpdater';\nimport { ErrorBoundary } from './components/ErrorBoundary';");

code = code.replace("<AppUpdater>", "<AppUpdater>\n          <ErrorBoundary>");
code = code.replace("</AppUpdater>", "  </ErrorBoundary>\n        </AppUpdater>");

fs.writeFileSync('src/App.tsx', code);
