import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { HardHat, Users, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [totalObras, setTotalObras] = useState(0);
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [presentesHoje, setPresentesHoje] = useState(0);
  const [faltasHoje, setFaltasHoje] = useState(0);
  const [valorTotalHoje, setValorTotalHoje] = useState(0);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const hoje = format(new Date(), 'yyyy-MM-dd');
        const stats = await api.getDashboardStats(hoje);
        
        setTotalObras(stats.totalObras);
        setTotalFuncionarios(stats.totalFuncionarios);
        setPresentesHoje(stats.presentesHoje);
        setFaltasHoje(stats.faltasHoje);
        setValorTotalHoje(stats.valorTotalHoje);
      } catch (error) {
        setErro('Ocorreu um erro ao carregar os dados.');
      }
    }
    loadData();
  }, []);

  const cards = [
    { name: 'Total de Obras', value: totalObras, icon: HardHat, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total de Funcionários', value: totalFuncionarios, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Presentes Hoje', value: presentesHoje, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Faltas Hoje', value: faltasHoje, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Valor Diárias Hoje', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalHoje), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      {erro && (<div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{erro}</div>)}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
