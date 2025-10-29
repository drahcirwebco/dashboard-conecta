

import React from 'react';
import type { Venda } from '../types';
import { XIcon } from './icons/XIcon';
import { parseRobust } from '../../utils/dateUtils';

interface SaleDetailModalProps {
  sale: Venda;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-light-text dark:text-dark-text sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);


const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-details-title"
    >
      <div
        className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fechar modal"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="pr-8">
            <h3 id="sale-details-title" className="text-xl font-bold text-light-text dark:text-dark-text">
                Detalhes da Venda #{sale.id}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Informações completas sobre a transação.
            </p>
        </div>
        
        <div className="mt-5 border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <DetailRow label="Parceiro" value={sale.nome_parceiro} />
                <DetailRow label="Valor da Venda" value={sale.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <DetailRow label="Data da Venda" value={(() => {
                    const date = parseRobust(sale.data_venda);
                    if (!date) return 'Data Inválida';

                    const day = date.getUTCDate();
                    const month = date.getUTCMonth(); // 0-indexed
                    const year = date.getUTCFullYear();

                    if (year < 2000) return 'Data Inconsistente';

                    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                    const monthName = monthNames[month];
                    
                    return `${day} de ${monthName} de ${year}`;
                })()} />
                <DetailRow label="Forma de Pagamento" value={sale.detalhes_tipoPagamento} />
            </dl>
        </div>

      </div>
       <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SaleDetailModal;