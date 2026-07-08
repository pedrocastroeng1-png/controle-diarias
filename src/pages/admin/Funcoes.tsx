import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Funcao } from '../../lib/types';
import { Edit2, Trash2, Plus } from 'lucide-react';

export default function Funcoes() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [nome, setNome] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    loadFuncoes();
  }, []);

  async function loadFuncoes() {
    const data = await api.getFuncoes();
    setFuncoes(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !valorDiaria) return;

    const valor = parseFloat(valorDiaria.replace(',', '.'));
    
    if (editId) {
      await api.updateFuncao(editId, { nome, valor_diaria: valor });
      setEditId(null);
    } else {
      await api.createFuncao({ nome, valor_diaria: valor });
    }
    setNome('');
    setValorDiaria('');
    loadFuncoes();
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      await api.deleteFuncao(id);
      loadFuncoes();
    }
  }

  function handleEdit(funcao: Funcao) {
    setEditId(funcao.id);
    setNome(funcao.nome);
    setValorDiaria(funcao.valor_diaria.toString());
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Funções</h2>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Função
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pedreiro Especial"
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="valorDiaria" className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Diária (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="valorDiaria"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              placeholder="0.00"
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors h-[42px]"
          >
            {editId ? 'Salvar' : <><Plus className="h-4 w-4 mr-2" /> Salvar</>}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setNome(''); setValorDiaria(''); }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors h-[42px]"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor da Diária
              </th>
              <th scope="col" className="relative px-6 py-3 w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {funcoes.length === 0 ? (
              <tr>
                 <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                   Nenhuma função cadastrada.
                 </td>
              </tr>
            ) : funcoes.map((funcao) => (
              <tr key={funcao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {funcao.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(funcao.valor_diaria)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 justify-center">
                  <button onClick={() => handleEdit(funcao)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(funcao.id)} className="text-red-600 hover:text-red-900 p-1" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
