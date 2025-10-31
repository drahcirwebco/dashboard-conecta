import React from 'react';
import type { Venda } from '../types';
import { XIcon } from './icons/XIcon';

interface ParceirosAtivosModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendas: Venda[];
  dateRange: string;
}

const ParceirosAtivosModal: React.FC<ParceirosAtivosModalProps> = ({
  isOpen,
  onClose,
  vendas,
  dateRange
}) => {
  if (!isOpen) return null;

  // Agrupa vendas por parceiro e calcula valores
  const parceirosData = vendas
    .filter(venda => venda.nome_parceiro && venda.nome_parceiro.trim() !== '') // Mesma lógica do KPI
    .reduce((acc, venda) => {
      const parceiro = venda.nome_parceiro.trim();
      
      if (!acc[parceiro]) {
        acc[parceiro] = {
          nome: parceiro,
          totalVendas: 0,
          quantidadeVendas: 0,
          vendas: []
        };
      }
      
      acc[parceiro].totalVendas += venda.valor_venda;
      acc[parceiro].quantidadeVendas += 1;
      acc[parceiro].vendas.push(venda);
    
    return acc;
  }, {} as Record<string, {
    nome: string;
    totalVendas: number;
    quantidadeVendas: number;
    vendas: Venda[];
  }>);

  // Converte para array e ordena por valor de vendas
  const parceirosArray = Object.values(parceirosData)
    .sort((a, b) => b.totalVendas - a.totalVendas);

  const formatPeriod = (period: string) => {
    switch (period) {
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'all': return 'Período Completo';
      default: return 'Período Personalizado';
    }
  };

  const totalGeral = parceirosArray.reduce((sum, p) => sum + p.totalVendas, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Parceiros Ativos ({parceirosArray.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatPeriod(dateRange)} • Total: {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {parceirosArray.map((parceiro, index) => (
              <div
                key={parceiro.nome}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      #{index + 1} {parceiro.nome}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parceiro.quantidadeVendas} venda{parceiro.quantidadeVendas !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {parceiro.totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {((parceiro.totalVendas / totalGeral) * 100).toFixed(1)}% do total
                    </p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(parceiro.totalVendas / Math.max(...parceirosArray.map(p => p.totalVendas))) * 100}%` }}
                  />
                </div>

                {/* Detalhes expandíveis */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                    Ver {parceiro.quantidadeVendas} venda{parceiro.quantidadeVendas !== 1 ? 's' : ''}
                  </summary>
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                    {parceiro.vendas.slice(0, 10).map((venda, vendaIndex) => (
                      <div key={vendaIndex} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {venda.item_nome || 'Item não especificado'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {venda.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(venda.data_venda).toLocaleDateString('pt-BR')} • {venda.detalhes_tipoPagamento}
                        </div>
                      </div>
                    ))}
                    {parceiro.vendas.length > 10 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        ... e mais {parceiro.vendas.length - 10} venda{parceiro.vendas.length - 10 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              Total de {vendas.length} venda{vendas.length !== 1 ? 's' : ''} • {parceirosArray.length} parceiro{parceirosArray.length !== 1 ? 's' : ''} ativo{parceirosArray.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParceirosAtivosModal;