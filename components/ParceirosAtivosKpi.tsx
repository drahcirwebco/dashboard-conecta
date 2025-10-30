import React, { useMemo } from 'react';
import type { Venda } from '../types';

interface ParceirosAtivosKpiProps {
  data: Venda[];
  dateRange: string;
}

const ParceirosAtivosKpi: React.FC<ParceirosAtivosKpiProps> = ({ data, dateRange }) => {
  const { parceirosAtivos, periodoTexto } = useMemo(() => {
    // Extrair parceiros únicos que tiveram vendas no período filtrado
    const parceirosUnicos = new Set(
      data
        .filter(venda => venda.nome_parceiro && venda.nome_parceiro.trim() !== '')
        .map(venda => venda.nome_parceiro.trim())
    );
    
    // Definir o texto do período baseado no filtro atual
    let periodo = '';
    switch (dateRange) {
      case 'week':
        periodo = 'Esta semana';
        break;
      case 'month':
        periodo = 'Este mês';
        break;
      case 'all':
        periodo = 'Todos os períodos';
        break;
      default:
        periodo = 'Período atual';
    }
    
    return { 
      parceirosAtivos: parceirosUnicos.size,
      periodoTexto: periodo
    };
  }, [data, dateRange]);

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md transition-transform hover:scale-105 duration-300 border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">
        Parceiros Ativos
      </h3>
      <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-2">
        {parceirosAtivos}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        {periodoTexto}
      </p>
    </div>
  );
};

export default ParceirosAtivosKpi;