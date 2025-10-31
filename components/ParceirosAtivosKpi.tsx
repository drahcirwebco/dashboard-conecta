import React, { useMemo, useState } from 'react';
import type { Venda } from '../types';
import ParceirosAtivosModal from './ParceirosAtivosModal';

interface ParceirosAtivosKpiProps {
  data: Venda[];
  dateRange: string;
}

const ParceirosAtivosKpi: React.FC<ParceirosAtivosKpiProps> = ({ data, dateRange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { parceirosAtivos, periodoTexto } = useMemo(() => {
    const parceirosUnicos = new Set(
      data
        .filter(venda => venda.nome_parceiro && venda.nome_parceiro.trim() !== '')
        .map(venda => venda.nome_parceiro.trim())
    );
    
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

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md transition-transform hover:scale-105 duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg"
        onClick={handleClick}
      >
        <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">
          Parceiros Ativos
        </h3>
        <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-2">
          {parceirosAtivos}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {periodoTexto}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 opacity-75">
          Clique para ver detalhes
        </p>
      </div>

      <ParceirosAtivosModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vendas={data}
        dateRange={dateRange}
      />
    </>
  );
};

export default ParceirosAtivosKpi;
