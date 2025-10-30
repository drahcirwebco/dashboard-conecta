

import React from 'react';
import type { Venda } from '../types';
import { parseRobust } from '../utils/dateUtils';

interface RecentSalesTableProps {
  data: Venda[];
  onRowClick: (sale: Venda) => void;
}

const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ data, onRowClick }) => {
  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Parceiro
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="bg-light-card dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((venda) => (
            <tr 
              key={venda.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
              onClick={() => onRowClick(venda)}
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{venda.nome_parceiro}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {venda.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {(() => {
                    const date = parseRobust(venda.data_venda);
                    if (!date) {
                        return 'Data Inválida';
                    }
                    
                    const day = String(date.getUTCDate()).padStart(2, '0');
                    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
                    const year = date.getUTCFullYear();

                    if (year < 2000) {
                        return 'Data Inconsistente';
                    }

                    return `${day}/${month}/${year}`;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentSalesTable;