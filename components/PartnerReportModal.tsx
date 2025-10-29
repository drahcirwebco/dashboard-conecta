
import React from 'react';
import { XIcon } from './icons/XIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import type { Venda } from '../types';
import { parseRobust } from '../utils/dateUtils';

interface PartnerReportModalProps {
  onClose: () => void;
  kpiData: { totalRevenue: number; avgTicket: number; totalSales: number };
  vendas: Venda[];
  selectedParceiroNames: string[];
  dateRange: string;
}

const PartnerReportModal: React.FC<PartnerReportModalProps> = ({ 
    onClose, 
    kpiData, 
    vendas,
    selectedParceiroNames,
    dateRange
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getDateRangeLabel = () => {
    switch(dateRange) {
        case 'week': return 'Esta Semana';
        case 'month': return 'Este Mês';
        default: return 'Período Completo';
    }
  };

  const getPartnerFilterLabel = () => {
    if (selectedParceiroNames.length === 0) return 'Todos os Parceiros';
    if (selectedParceiroNames.length > 2) return `${selectedParceiroNames.length} parceiros selecionados`;
    return selectedParceiroNames.join(', ');
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center print:bg-white"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        <div
          className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl m-4 relative animate-fade-in-up flex flex-col h-[90vh] print:shadow-none print:border-none print:h-full print:w-full print:max-w-full print:m-0 print:rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 print:hidden">
            <h3 id="report-title" className="text-lg font-bold text-light-text dark:text-dark-text">
              Pré-visualização do Relatório
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </header>

          {/* Report Content Wrapper */}
          <main className="flex-grow overflow-y-auto print:overflow-visible">
            <div id="report-content" className="p-8 bg-white text-black">
                {/* Report Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ChartBarIcon className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Relatório de Vendas
                            </h1>
                        </div>
                        <p className="text-gray-500">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                    <div className="text-right text-sm">
                        <h4 className="font-bold text-gray-600 uppercase tracking-wider mb-1">Filtros Aplicados</h4>
                        <p><strong>Período:</strong> {getDateRangeLabel()}</p>
                        <p><strong>Parceiros:</strong> {getPartnerFilterLabel()}</p>
                    </div>
                </div>

                {/* KPIs */}
                <section className="grid grid-cols-3 gap-6 mb-8 border-y border-gray-200 py-6">
                    <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valor Total</h4>
                        <p className="text-3xl font-bold text-gray-800">{kpiData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                     <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</h4>
                        <p className="text-3xl font-bold text-gray-800">{kpiData.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                     <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Vendas</h4>
                        <p className="text-3xl font-bold text-gray-800">{kpiData.totalSales.toLocaleString('pt-BR')}</p>
                    </div>
                </section>

                {/* Sales Details Table */}
                <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes das Vendas</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                {selectedParceiroNames.length !== 1 && (
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Parceiro</th>
                                )}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Vendido</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendas.map((venda) => (
                                <tr key={venda.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{
                                        (() => {
                                            const date = parseRobust(venda.data_venda);
                                            if (!date) return 'N/A';
                                            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                        })()
                                    }</td>
                                    {selectedParceiroNames.length !== 1 && (
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.nome_parceiro}</td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-gray-700">{venda.item_nome || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{venda.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                             {vendas.length === 0 && (
                              <tr>
                                  <td colSpan={selectedParceiroNames.length !== 1 ? 4 : 3} className="text-center py-10 text-gray-500">Nenhuma venda encontrada para os filtros selecionados.</td>
                              </tr>
                             )}
                        </tbody>
                    </table>
                </section>

                <footer className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-200">
                    Relatório gerado por Conecta_E-commerce Dashboard
                </footer>
            </div>
          </main>
          
          {/* Modal Footer */}
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-right flex-shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-light-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-offset-dark-card"
            >
              Salvar como PDF
            </button>
          </footer>
        </div>
      </div>
      
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
            body {
                background-color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
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
      `}</style>
    </>
  );
};

export default PartnerReportModal;
