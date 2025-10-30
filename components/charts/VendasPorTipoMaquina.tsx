import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Venda } from '../../types';
import TipoMaquinaDetailModal from '../TipoMaquinaDetailModal';

interface VendasPorTipoMaquinaProps {
  data: Venda[];
  theme: string;
}

const VendasPorTipoMaquina: React.FC<VendasPorTipoMaquinaProps> = ({ data, theme }) => {
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função melhorada para identificar o tipo de máquina baseado no item_nome
  const identificarTipoMaquina = (itemNome: string): string => {
    if (!itemNome || itemNome.trim() === '') return 'Outros';
    
    const nome = itemNome.toLowerCase().trim();
    
    // Primeiro, verificar se é realmente um ar-condicionado
    const isArCondicionado = nome.includes('split') || 
                            nome.includes('condicionado') || 
                            nome.includes('ar-condicionado') ||
                            nome.includes('cassete') ||
                            nome.includes('evaporadora') ||
                            nome.includes('condensadora') ||
                            nome.includes('hi-wall') ||
                            nome.includes('hiwall') ||
                            nome.includes('climatizador') ||
                            nome.match(/\b(btus?|btu\/h)\b/i) ||
                            nome.match(/\b\d+k?\s*(btus?|btu\/h)?\b/i); // Padrão de BTUs
    
    // Se não for ar-condicionado, retorna 'Outros'
    if (!isArCondicionado) {
      return 'Outros';
    }
    
    // Padrões mais específicos para High-Wall
    if (nome.includes('hi-wall') || 
        nome.includes('hi wall') || 
        nome.includes('hiwall') ||
        (nome.includes('split') && (nome.includes('parede') || nome.includes('wall'))) ||
        nome.match(/\bhigh[\s-]?wall\b/)) {
      return 'High-Wall';
    }
    
    // Padrões para Cassete (evitar confusão com outras palavras)
    if (nome.match(/\bcassete\b/) || 
        nome.match(/\bk7\b/) ||
        nome.includes('cassette') ||
        (nome.includes('teto') && nome.includes('embutir'))) {
      return 'Cassete';
    }
    
    // Padrões para Teto (mas não cassete)
    if ((nome.includes('teto') && !nome.includes('cassete') && !nome.includes('embutir')) ||
        nome.includes('ceiling') ||
        nome.match(/\bpiso[\s-]?teto\b/)) {
      return 'Teto';
    }
    
    // Padrões para Multisplit - MAIS ESPECÍFICOS
    if ((nome.includes('multisplit') || 
         nome.includes('multi-split') ||
         nome.includes('multi split')) ||
        (nome.includes('multi') && (nome.includes('split') || nome.includes('evaporadora') || nome.includes('condensadora')))) {
      return 'Multisplit';
    }
    
    // Padrões gerais para Split (quando não for específico)
    if (nome.includes('split') && 
        !nome.includes('multi') && 
        !nome.includes('cassete') && 
        !nome.includes('teto')) {
      return 'High-Wall'; // A maioria dos splits são high-wall
    }
    
    // Se for ar-condicionado mas não conseguir identificar o tipo específico
    return 'High-Wall'; // Assume High-Wall como padrão para ar-condicionados não específicos
  };

  const chartData = useMemo(() => {
    // Agrupar vendas por tipo de máquina
    const vendasPorTipo = data.reduce((acc, venda) => {
      const tipo = identificarTipoMaquina(venda.item_nome || '');
      
      if (!acc[tipo]) {
        acc[tipo] = {
          tipo,
          quantidade: 0,
          valor: 0
        };
      }
      
      acc[tipo].quantidade += 1;
      acc[tipo].valor += venda.valor_venda;
      
      return acc;
    }, {} as Record<string, { tipo: string; quantidade: number; valor: number }>);

    // Converter para array, filtrar "Outros" e ordenar por quantidade
    return Object.values(vendasPorTipo)
      .filter(item => item.tipo !== 'Outros') // Remove produtos que não são ar-condicionado
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [data]);

  // Filtrar vendas do tipo selecionado
  const vendasSelecionadas = useMemo(() => {
    if (!selectedTipo) return [];
    return data.filter(venda => identificarTipoMaquina(venda.item_nome || '') === selectedTipo);
  }, [data, selectedTipo]);

  const handleBarClick = (data: any) => {
    if (data && data.tipo) {
      setSelectedTipo(data.tipo);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTipo(null);
  };

  const isDark = theme === 'dark';
  const accentColor = theme === 'dark' ? '#4299e1' : '#3182ce';

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 50,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="tipo"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#f9fafb' : '#111827',
            }}
            formatter={(value: number, name: string) => [
              name === 'quantidade' ? `${value} vendas` : 
              name === 'valor' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value,
              name === 'quantidade' ? 'Quantidade' : 'Valor Total'
            ]}
            labelStyle={{ color: isDark ? '#f9fafb' : '#111827' }}
          />
          <Bar 
            dataKey="quantidade" 
            fill={accentColor}
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={accentColor} />
            ))}
            <LabelList 
              dataKey="quantidade" 
              position="top" 
              style={{ 
                fill: isDark ? '#f9fafb' : '#111827',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Descrição explicativa */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          * Apenas equipamentos de ar-condicionado. Clique nas barras para detalhes.
        </p>
      </div>

      {/* Modal de detalhes */}
      <TipoMaquinaDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tipoMaquina={selectedTipo || ''}
        vendas={vendasSelecionadas}
      />
    </div>
  );
};

export default VendasPorTipoMaquina;