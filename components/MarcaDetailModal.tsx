import React from 'react';
import type { Venda } from '../types';
import { XIcon } from './icons/XIcon';
import { parseRobust } from '../utils/dateUtils';

interface MarcaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  marca: string;
  vendas: Venda[];
}

const MarcaDetailModal: React.FC<MarcaDetailModalProps> = ({
  isOpen,
  onClose,
  marca,
  vendas
}) => {
  if (!isOpen) return null;

  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((sum, venda) => sum + venda.valor_venda, 0);
  const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

  // Agrupar por produto
  const produtosSummary = vendas.reduce((acc, venda) => {
    const produto = venda.item_nome || 'Produto não identificado';
    if (!acc[produto]) {
      acc[produto] = {
        quantidade: 0,
        valor: 0,
        vendas: []
      };
    }
    acc[produto].quantidade += 1;
    acc[produto].valor += venda.valor_venda;
    acc[produto].vendas.push(venda);
    return acc;
  }, {} as Record<string, { quantidade: number; valor: number; vendas: Venda[] }>);

  const produtosOrdenados = Object.entries(produtosSummary)
    .map(([produto, data]) => ({ 
      produto, 
      quantidade: data.quantidade, 
      valor: data.valor, 
      vendas: data.vendas 
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Detalhes - Marca {marca}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {totalVendas} vendas • Valor total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* KPIs Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Vendas</h3>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{totalVendas}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Total</h3>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Médio</h3>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Produtos Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Produtos {marca} Vendidos
            </h3>
            <div className="space-y-3">
              {produtosOrdenados.map(({ produto, quantidade, valor }) => (
                <div key={produto} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-light-text dark:text-dark-text">{produto}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {quantidade} vendas • {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes das Vendas */}
          <div>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Histórico de Vendas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Data</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Produto</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Parceiro</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Pagamento</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas
                    .sort((a, b) => new Date(b.data_venda).getTime() - new Date(a.data_venda).getTime())
                    .map((venda) => {
                      const dataVenda = parseRobust(venda.data_venda);
                      return (
                        <tr key={venda.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-2 text-light-text dark:text-dark-text">
                            {dataVenda ? dataVenda.toLocaleDateString('pt-BR') : 'Data inválida'}
                          </td>
                          <td className="py-3 px-2 text-light-text dark:text-dark-text">
                            {venda.item_nome || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-light-text dark:text-dark-text">
                            {venda.nome_parceiro || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-light-text dark:text-dark-text">
                            {venda.detalhes_tipoPagamento || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-right text-light-text dark:text-dark-text font-medium">
                            {venda.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcaDetailModal;