import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Obra, Presenca } from '../../lib/types';
import { format, parseISO } from 'date-fns';
import { FileDown, Printer, Search, Table as TableIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState('');
  
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
  
  const [relatorio, setRelatorio] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadObras();
  }, []);

  async function loadObras() {
    const data = await api.getObras();
    setObras(data);
    if (data.length > 0) {
      setObraId(data[0].id);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!obraId || !dataInicial || !dataFinal) return;

    setLoading(true);
    try {
      const data = await api.getRelatorio(dataInicial, dataFinal, obraId);
      setRelatorio(data);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const agruparPorFuncionario = () => {
    const agrupado: Record<string, { nome: string, funcao: string, dias: number, faltas: number, valorDiaria: number, total: number }> = {};
    
    relatorio.forEach((p: any) => {
      const fId = p.funcionario_id;
      if (fId) {
        if (!agrupado[fId]) {
          agrupado[fId] = {
            nome: p.funcionario_nome || '',
            funcao: p.funcao_nome || '',
            dias: 0,
            faltas: 0,
            valorDiaria: Number(p.valor_diaria) || 0,
            total: 0
          };
        }
        if (p.presente) {
          agrupado[fId].dias += 1;
          agrupado[fId].total += agrupado[fId].valorDiaria;
        } else {
          agrupado[fId].faltas += 1;
        }
      }
    });

    return Object.values(agrupado).sort((a, b) => a.nome.localeCompare(b.nome));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const obraNome = obras.find(o => o.id === obraId)?.nome || '';
    const periodStr = `${format(parseISO(dataInicial), 'dd/MM/yyyy')} a ${format(parseISO(dataFinal), 'dd/MM/yyyy')}`;
    
    const agrupado = agruparPorFuncionario();
    const totalFolha = agrupado.reduce((acc, curr) => acc + curr.total, 0);
    const totalDiarias = agrupado.reduce((acc, curr) => acc + curr.dias, 0);
    const totalFaltas = agrupado.reduce((acc, curr) => acc + curr.faltas, 0);
    const totalFuncionarios = agrupado.length;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('EMPRESA LTDA', 14, 22);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text('Relatório de Controle de Diárias', 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Obra: ${obraNome}`, 14, 42);
    doc.text(`Período: ${periodStr}`, 14, 48);
    doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 54);

    const tableColumn = ["Funcionário", "Função", "Presenças", "Faltas", "Valor Diária", "Total"];
    const tableRows = agrupado.map(f => [
      f.nome,
      f.funcao,
      f.dias.toString(),
      f.faltas.toString(),
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valorDiaria),
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.total)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] } // Blue-600
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setFontSize(11);
    doc.text(`Total de Funcionários: ${totalFuncionarios}`, 14, finalY + 10);
    doc.text(`Total de Presenças (Diárias): ${totalDiarias}`, 14, finalY + 16);
    doc.text(`Total de Faltas: ${totalFaltas}`, 14, finalY + 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Valor Total da Folha: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFolha)}`, 14, finalY + 32);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 10);
    }

    doc.save(`Relatorio_${obraNome.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportExcel = () => {
    const obraNome = obras.find(o => o.id === obraId)?.nome || '';
    const excelData = relatorio.map((p: any) => {
      const funcionarioNome = p.funcionario_nome || '';
      const funcaoNome = p.funcao_nome || '';
      const valorDiaria = Number(p.valor_diaria) || 0;
      
      return {
        'Funcionário': funcionarioNome,
        'Função': funcaoNome,
        'Obra': p.obra_nome || obraNome,
        'Data': format(parseISO(p.data), 'dd/MM/yyyy'),
        'Status': p.presente ? 'Presente' : 'Falta',
        'Valor da Diária': p.presente ? valorDiaria : 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Diárias");

    const maxWidths = excelData.reduce((acc, row) => {
      Object.keys(row).forEach(key => {
        const val = String((row as any)[key]);
        acc[key] = Math.max(acc[key] || key.length, val.length);
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(maxWidths).map(key => ({ wch: maxWidths[key] + 2 }));

    XLSX.writeFile(workbook, `Relatorio_${obraNome.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const relatorioAgrupado = agruparPorFuncionario().filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const valorTotal = relatorioAgrupado.reduce((acc, curr) => acc + curr.total, 0);
  const totaisDias = relatorioAgrupado.reduce((acc, curr) => acc + curr.dias, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        {hasSearched && (
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
        )}
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
              required
            >
              <option value="" disabled>Selecione</option>
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
              required
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
              required
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

      {hasSearched && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resultado do Relatório</h3>
              <p className="text-sm text-gray-500">
                Resumo de folha de pagamento para o período selecionado.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" /> Imprimir
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
            <p className="text-sm mb-1"><strong>Obra:</strong> {obras.find(o => o.id === obraId)?.nome}</p>
            <p className="text-sm mb-6"><strong>Período:</strong> {format(parseISO(dataInicial), 'dd/MM/yyyy')} a {format(parseISO(dataFinal), 'dd/MM/yyyy')}</p>
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias Trabalhados
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor da Diária
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Recebido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatorioAgrupado.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {item.dias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorDiaria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {relatorioAgrupado.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      TOTAIS:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-center">
                      {totaisDias} diárias
                    </td>
                    <td></td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          <div className="hidden print:block p-8 mt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-right">
              Data de Emissão: {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
