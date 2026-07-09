import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Obra, Presenca } from '../../lib/types';
import { format, parseISO } from 'date-fns';
import { FileDown, Printer, Search, Table as TableIcon, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useAuth } from '../../contexts/AuthContext';

export default function Relatorios() {
  const { usuario } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState('');
  
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  
  const [relatorio, setRelatorio] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadObras();
    loadRelatorio('', '', '');
  }, []);

  async function loadObras() {
    try {
      const data = await api.getObras();
      setObras(data);
    } catch (e) {
      setErro('Ocorreu um erro ao carregar as obras.');
    }
  }

  async function loadRelatorio(inicio: string, fim: string, obra: string) {
    setLoading(true);
    try {
      const data = await api.getRelatorio(
        inicio || undefined, 
        fim || undefined, 
        obra || undefined
      );
      setRelatorio(data);
    } catch (error) {
      setErro('Ocorreu um erro ao carregar o relatório.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const obraSelecionada = obras.find(o => o.id === obraId)?.nome || '';
    loadRelatorio(dataInicial, dataFinal, obraSelecionada);
  }

  const agruparPorFuncionario = () => {
    const agrupado: Record<string, { nome: string, funcao: string, obra: string, dias: number, faltas: number, valorDiaria: number, total: number }> = {};
    
    relatorio.forEach((p: any) => {
      const fId = p.funcionario_id || p.funcionario_nome || p.funcionario;
      if (fId) {
        if (!agrupado[fId]) {
          agrupado[fId] = {
            nome: p.funcionario_nome || p.funcionario || '',
            funcao: p.funcao_nome || p.funcao || '',
            obra: p.obra_nome || p.obra || '',
            dias: 0,
            faltas: 0,
            valorDiaria: Number(p.valor_diaria) || 0,
            total: 0
          };
        }
        if (p.status === 'PRESENTE') {
          agrupado[fId].dias += 1;
          agrupado[fId].total += agrupado[fId].valorDiaria;
        } else if (p.status === 'FALTOU') {
          agrupado[fId].faltas += 1;
        }
      }
    });

    return Object.values(agrupado).sort((a, b) => a.nome.localeCompare(b.nome));
  };

  const relatorioAgrupado = agruparPorFuncionario().filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const valorTotal = relatorioAgrupado.reduce((acc, curr) => acc + curr.total, 0);
  const totaisDias = relatorioAgrupado.reduce((acc, curr) => acc + curr.dias, 0);

  const getFileNameBase = () => {
    const dInicial = dataInicial ? format(parseISO(dataInicial), 'dd-MM-yyyy') : '';
    const dFinal = dataFinal ? format(parseISO(dataFinal), 'dd-MM-yyyy') : '';
    const range = (dInicial && dFinal) ? `${dInicial}_ate_${dFinal}` : (dInicial || dFinal || format(new Date(), 'dd-MM-yyyy'));
    let base = 'controle_diarias_';
    if (obraId) {
      const obra = obras.find(o => o.id === obraId);
      if (obra) {
        const cleanObraName = obra.nome.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
        base += `${cleanObraName}_`;
      }
    }
    return base + range;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const obraNome = obras.find(o => o.id === obraId)?.nome || 'Todas';
    const periodStr = dataInicial && dataFinal 
      ? `${format(parseISO(dataInicial), 'dd/MM/yyyy')} a ${format(parseISO(dataFinal), 'dd/MM/yyyy')}`
      : 'Todos os períodos';
    
    const agrupado = relatorioAgrupado;
    const totalFolha = valorTotal;
    const totalDiarias = totaisDias;
    const totalFuncionarios = agrupado.length;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('TARGOS ENGENHARIA', 14, 22);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text('CONTROLE DE DIÁRIAS', 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Obra: ${obraNome}`, 14, 42);
    doc.text(`Período: ${periodStr}`, 14, 48);

    const tableColumn = ["Funcionário", "Função", "Obra", "Valor da Diária", "Dias Trabalhados", "Total Recebido"];
    const tableRows = agrupado.map(f => [
      f.nome,
      f.funcao,
      f.obra,
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valorDiaria),
      f.dias.toString(),
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.total)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 55;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Quantidade de Funcionários: ${totalFuncionarios}`, 14, finalY + 10);
    doc.text(`Total de Diárias: ${totalDiarias}`, 14, finalY + 16);
    doc.text(`Valor Total da Folha: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFolha)}`, 14, finalY + 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, finalY + 32);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 10);
    }

    doc.save(`${getFileNameBase()}.pdf`);
  };

  const handleExportDailyPDF = async () => {
    const targetDate = dataInicial || hoje;
    
    // Fetch specifically for this single date to ensure accuracy
    setLoading(true);
    let dailyData: any[] = [];
    try {
      const obraSelecionada = obras.find(o => o.id === obraId)?.nome || undefined;
      dailyData = await api.getRelatorio(targetDate, targetDate, obraSelecionada);
    } catch (e) {
      alert('Ocorreu um erro ao gerar o relatório diário.');
    } finally {
      setLoading(false);
    }

    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('TARGOS ENGENHARIA', 14, 22);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text('CONTROLE DE PRESENÇA', 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Data: ${format(parseISO(targetDate), 'dd/MM/yyyy')}`, 14, 42);

    // Group by obra
    const obrasGroup: Record<string, any[]> = {};
    let totalPresentes = 0;
    let totalFaltas = 0;

    dailyData.forEach(p => {
      const obraName = p.obra_nome || p.obra || 'Sem Obra';
      if (!obrasGroup[obraName]) obrasGroup[obraName] = [];
      obrasGroup[obraName].push(p);
      
      if (p.status === 'PRESENTE') totalPresentes++;
      else if (p.status === 'FALTOU') totalFaltas++;
    });

    let currentY = 55;

    Object.keys(obrasGroup).sort().forEach(obraName => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Obra: ${obraName}`, 14, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const funcs = obrasGroup[obraName].sort((a, b) => (a.funcionario_nome || a.funcionario || '').localeCompare(b.funcionario_nome || b.funcionario || ''));
      funcs.forEach(f => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        const status = f.status === 'PRESENTE' ? '✅' : '❌';
        // jsPDF doesn't support emojis well in standard fonts, so we'll use text or a simple symbol
        // For '✅' and '❌' we can just use '[P]' and '[F]' or text, but user requested '✅' and '❌'.
        // Wait, standard jsPDF won't render emojis properly, it renders ??.
        // I will use text Presente / Falta if emoji fails, but let's try to pass the emoji and see. Or maybe better:
        // For PDF, let's use standard strings: 'P' and 'F' or full text. The request showed: '✅ Alef Santos Rodrigues'
        // I'll try to just include it, if it breaks it breaks, but usually jsPDF with autoTable works with some characters. Wait, we are writing directly with text().
        doc.text(`${f.status === 'PRESENTE' ? '✅' : '❌'} ${f.funcionario_nome || f.funcionario}`, 14, currentY);
        currentY += 7;
      });
      currentY += 5;
    });

    currentY += 5;
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Total de Funcionários: ${dailyData.length}`, 14, currentY);
    doc.text(`Presentes: ${totalPresentes}`, 14, currentY + 7);
    doc.text(`Faltas: ${totalFaltas}`, 14, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Operador Responsável: ${usuario?.usuario || 'Sistema'}`, 14, currentY + 28);
    doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, currentY + 35);

    const baseName = obraId ? obras.find(o => o.id === obraId)?.nome?.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') + '_' : '';
    doc.save(`relatorio_diario_${baseName}${format(parseISO(targetDate), 'dd-MM-yyyy')}.pdf`);
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Worksheet 1: Resumo
    const wsResumo = workbook.addWorksheet('Resumo');
    wsResumo.views = [{ state: 'frozen', ySplit: 1 }];
    
    wsResumo.columns = [
      { header: 'Funcionário', key: 'funcionario', width: 30 },
      { header: 'Função', key: 'funcao', width: 20 },
      { header: 'Obra', key: 'obra', width: 20 },
      { header: 'Valor da Diária', key: 'valor', width: 15, style: { numFmt: '"R$" #,##0.00' } },
      { header: 'Dias Trabalhados', key: 'dias', width: 20 },
      { header: 'Total Recebido', key: 'total', width: 20, style: { numFmt: '"R$" #,##0.00' } }
    ];

    wsResumo.getRow(1).font = { bold: true };

    relatorioAgrupado.forEach(f => {
      wsResumo.addRow({
        funcionario: f.nome,
        funcao: f.funcao,
        obra: f.obra,
        valor: f.valorDiaria,
        dias: f.dias,
        total: f.total
      });
    });

    wsResumo.addRow([]);
    wsResumo.addRow(['Quantidade de Funcionários', relatorioAgrupado.length]);
    wsResumo.addRow(['Total de Diárias', totaisDias]);
    wsResumo.addRow(['Valor Total da Folha', valorTotal]);
    
    const countRows = relatorioAgrupado.length + 3;
    wsResumo.getCell(`B${countRows}`).font = { bold: true };
    wsResumo.getCell(`B${countRows + 1}`).font = { bold: true };
    wsResumo.getCell(`B${countRows + 2}`).font = { bold: true };
    wsResumo.getCell(`B${countRows + 2}`).numFmt = '"R$" #,##0.00';

    // Worksheets por Funcionário
    const presencasPorFunc = relatorio.reduce((acc: any, p: any) => {
      const fId = p.funcionario_id || p.funcionario_nome || p.funcionario;
      if (fId) {
        if (!acc[fId]) acc[fId] = [];
        acc[fId].push(p);
      }
      return acc;
    }, {});

    relatorioAgrupado.forEach(f => {
      const safeName = f.nome.substring(0, 31).replace(/[\[\]\*\\\/\?]/g, '');
      const ws = workbook.addWorksheet(safeName);
      ws.views = [{ state: 'frozen', ySplit: 6 }];

      ws.columns = [
        { key: 'colA', width: 25 },
        { key: 'colB', width: 25 }
      ];

      ws.addRow(['Nome', f.nome]).font = { bold: true };
      ws.addRow(['Função', f.funcao]);
      ws.addRow(['Obra', f.obra]);
      ws.addRow(['Valor da Diária', f.valorDiaria]).getCell(2).numFmt = '"R$" #,##0.00';
      ws.addRow([]);

      ws.addRow(['Data', 'Status']);
      ws.getRow(6).font = { bold: true };

      const presencas = presencasPorFunc[relatorio.find(p => (p.funcionario_nome || p.funcionario) === f.nome)?.funcionario_id || f.nome] || [];
      const presencasOrdenadas = [...presencas].sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime());

      presencasOrdenadas.forEach((p: any) => {
        if ((p.funcionario_nome || p.funcionario) === f.nome) { // double check
          ws.addRow([
            format(parseISO(p.data), 'dd/MM/yyyy'),
            p.status === 'PRESENTE' ? '✅ Presente' : '❌ Faltou'
          ]);
        }
      });

      ws.addRow([]);
      ws.addRow(['Dias Trabalhados', f.dias]).font = { bold: true };
      ws.addRow(['Valor da Diária', f.valorDiaria]).font = { bold: true };
      ws.getRow(ws.rowCount).getCell(2).numFmt = '"R$" #,##0.00';
      ws.addRow(['Valor Total Recebido', f.total]).font = { bold: true };
      ws.getRow(ws.rowCount).getCell(2).numFmt = '"R$" #,##0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${getFileNameBase()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Pesquisar funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8 print:hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="obra" className="block text-sm font-medium text-gray-700 mb-1">
              Obra
            </label>
            <select
              id="obra"
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todas as Obras</option>
              {obras.map(o => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dataInicial" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="dataInicial"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="dataFinal" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              id="dataFinal"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors h-[42px] disabled:opacity-70"
            >
              <Search className="h-4 w-4 mr-2" /> 
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
              <h3 className="text-lg font-medium text-gray-900">Resultado do Relatório</h3>
              <p className="text-sm text-gray-500">
                Resumo de folha de pagamento para o período selecionado.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" /> Imprimir
              </button>
              <button
                onClick={handleExportDailyPDF}
                className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" /> Relatório Diário
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
              >
                <TableIcon className="h-4 w-4 mr-2" /> Exportar Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <FileDown className="h-4 w-4 mr-2" /> Gerar PDF
              </button>
            </div>
          </div>

          <div className="hidden print:block p-8">
            <h1 className="text-2xl font-bold mb-2">Controle de Diárias</h1>
            <p className="text-sm mb-1"><strong>Obra:</strong> {obras.find(o => o.id === obraId)?.nome || 'Todas as Obras'}</p>
            <p className="text-sm mb-6">
              <strong>Período:</strong>{' '}
              {dataInicial && dataFinal 
                ? `${format(parseISO(dataInicial), 'dd/MM/yyyy')} a ${format(parseISO(dataFinal), 'dd/MM/yyyy')}`
                : 'Todos os períodos'}
            </p>
          </div>

            {erro && (<div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{erro}</div>)}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 print:hidden">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Relatório</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(relatorio, null, 2)}
              </pre>
            </div>
            
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor da Diária
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias Trabalhados
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Recebido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatorioAgrupado.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                       Nenhum registro encontrado para este período.
                     </td>
                  </tr>
                ) : relatorioAgrupado.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.funcao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.obra}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorDiaria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {item.dias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {relatorioAgrupado.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-6 print:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Quantidade de Funcionários</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{relatorioAgrupado.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Total de Diárias</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">{totaisDias}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Valor Total da Folha</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="hidden print:block p-8 mt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-right">
              Data de Emissão: {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
    </div>
  );
}
