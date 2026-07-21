const fs = require('fs');
let code = fs.readFileSync('src/pages/operador/Presenca.tsx', 'utf8');

// We need to inject communications state
code = code.replace(
  "const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);",
  "const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);\n  const [unreadComms, setUnreadComms] = useState<any[]>([]);\n  const [currentCommIndex, setCurrentCommIndex] = useState(0);\n  const [commsFinished, setCommsFinished] = useState(false);\n  const [readingComms, setReadingComms] = useState(true);"
);

// We need to fetch unread mandatory communications
const loadDataRegex = /const \[presencasData, atestados\] = await Promise\.all\(\[/;
const loadDataReplace = `
      // Check communications if operator
      if (!isAdmin) {
         try {
           const comms = await api.getUnreadMandatoryCommunications(usuario.id);
           if (comms && comms.length > 0) {
             setUnreadComms(comms);
             setReadingComms(true);
           } else {
             setReadingComms(false);
           }
         } catch (e) {
           console.error("Error loading communications", e);
           setReadingComms(false); // Fallback
         }
      } else {
         setReadingComms(false);
      }

      const [presencasData, atestados] = await Promise.all([
`;

code = code.replace(loadDataRegex, loadDataReplace);

// We need to inject the Communication Reader UI and Summary UI above the Presenca module, or render it INSTEAD of the Presenca module if readingComms is true.
const returnRegex = /return \(\n\s*<div className="max-w-5xl mx-auto space-y-6">/;

const commsUIRender = `
  const handleConfirmRead = async () => {
    try {
      const currentComm = unreadComms[currentCommIndex];
      await api.markCommunicationAsRead(currentComm.id, usuario.id);
      
      if (currentCommIndex < unreadComms.length - 1) {
         setCurrentCommIndex(currentCommIndex + 1);
      } else {
         setCommsFinished(true);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao confirmar leitura.');
    }
  };

  const activeWorksitesCount = Array.from(new Set(funcionarios.map(f => f.obra_id))).length;
  const onMedicalLeaveCount = Object.keys(atestadosAtivos).length;

  if (readingComms && !isAdmin) {
    if (!commsFinished && unreadComms.length > 0) {
       const currentComm = unreadComms[currentCommIndex];
       return (
         <div className="max-w-3xl mx-auto min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
               <div className="bg-blue-600 px-6 py-8 text-center text-white relative">
                 <div className="absolute top-4 right-4 bg-blue-700/50 px-3 py-1 rounded-full text-xs font-bold">
                    Comunicação {currentCommIndex + 1} de {unreadComms.length}
                 </div>
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <span className="text-3xl">📢</span>
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-wider">Comunicação Operacional</h2>
               </div>
               
               <div className="p-8 space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Título</h3>
                   <p className="text-xl font-bold text-gray-900">{currentComm.title}</p>
                 </div>
                 
                 <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Mensagem</h3>
                   <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 text-lg leading-relaxed border border-gray-100 whitespace-pre-wrap">
                     {currentComm.message}
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase">Data</p>
                     <p className="text-sm font-medium text-gray-900 mt-1">{format(parseISO(currentComm.created_at), 'dd/MM/yyyy')}</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase">Enviado por</p>
                     <p className="text-sm font-medium text-gray-900 mt-1">{currentComm.creator?.usuario || 'Administrador'}</p>
                   </div>
                 </div>
                 
                 <div className="pt-6">
                   <button
                     onClick={handleConfirmRead}
                     className="w-full flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                   >
                     <span className="mr-3 text-2xl">✔</span> LIDO E COMPREENDIDO
                   </button>
                 </div>
               </div>
            </div>
         </div>
       );
    }
    
    if (commsFinished) {
       return (
         <div className="max-w-3xl mx-auto min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-10">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">✅</span>
               </div>
               <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Todas as Comunicações Lidas</h2>
               <p className="text-xl text-gray-500 mb-10">Bom trabalho! Registre a presença de hoje com atenção.</p>
               
               <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-10 border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-2">Lembre-se:</h3>
                 <ul className="space-y-3 text-gray-600">
                   <li className="flex items-start"><span className="text-blue-500 mr-2">•</span> Verifique cada funcionário antes de confirmar presença.</li>
                   <li className="flex items-start"><span className="text-blue-500 mr-2">•</span> Tire uma foto nítida de confirmação.</li>
                   <li className="flex items-start"><span className="text-blue-500 mr-2">•</span> Siga todas as instruções operacionais repassadas.</li>
                 </ul>
                 <p className="font-bold text-gray-900 pt-2 text-center">Tenha um excelente dia de trabalho! Boa sorte!</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <p className="text-xs font-bold text-blue-600 uppercase mb-1">Funcionários para registrar</p>
                   <p className="text-3xl font-black text-blue-900">{funcionarios.length - onMedicalLeaveCount}</p>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                   <p className="text-xs font-bold text-orange-600 uppercase mb-1">Obras Ativas</p>
                   <p className="text-3xl font-black text-orange-900">{activeWorksitesCount}</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                   <p className="text-xs font-bold text-red-600 uppercase mb-1">Em Atestado Médico</p>
                   <p className="text-3xl font-black text-red-900">{onMedicalLeaveCount}</p>
                 </div>
                 <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                   <p className="text-xs font-bold text-green-600 uppercase mb-1">Comunicações Lidas</p>
                   <p className="text-3xl font-black text-green-900">{unreadComms.length}</p>
                 </div>
               </div>
               
               <button
                 onClick={() => setReadingComms(false)}
                 className="w-full flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
               >
                 <span className="mr-3 text-2xl">🚀</span> INICIAR PRESENÇA
               </button>
            </div>
         </div>
       );
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
`;

code = code.replace(returnRegex, commsUIRender);

fs.writeFileSync('src/pages/operador/Presenca.tsx', code);
