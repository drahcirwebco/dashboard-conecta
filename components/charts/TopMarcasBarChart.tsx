import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import type { Venda } from '../../types';
import MarcaDetailModal from '../MarcaDetailModal';

interface TopMarcasBarChartProps {
  data: Venda[];
  theme: string;
}

const TopMarcasBarChart: React.FC<TopMarcasBarChartProps> = ({ data, theme }) => {
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lista das marcas que trabalhamos
  const marcas = [
    'Gree', 'Hisense', 'Philco', 'Electrolux', 'Midea', 
    'Springer', 'Carrier', 'Samsung', 'LG', 'Elgin'
  ];

  // Função para identificar a marca no item_nome
  const identificarMarca = (itemNome: string): string | null => {
    if (!itemNome) return null;
    
    const nome = itemNome.toLowerCase();
    
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
    
    // Se não for ar-condicionado, não identifica marca
    if (!isArCondicionado) {
      return null;
    }
    
    // Procurar marcas de forma mais flexível
    for (const marca of marcas) {
      const marcaLower = marca.toLowerCase();
      
      // Usar includes simples para detectar a marca em qualquer lugar do nome
      if (nome.includes(marcaLower)) {
        // Verificação especial para evitar falso positivo de "LG" em "Elgin"
        if (marcaLower === 'lg' && nome.includes('elgin')) {
          continue; // Pula LG se o nome contém "elgin"
        }
        return marca;
      }
    }
    
    return null;
  };

  // Função auxiliar para verificar se é ar-condicionado
  const isArCondicionado = (itemNome: string): boolean => {
    if (!itemNome) return false;
    const nome = itemNome.toLowerCase();
    
    return nome.includes('split') || 
           nome.includes('condicionado') || 
           nome.includes('ar-condicionado') ||
           nome.includes('cassete') ||
           nome.includes('evaporadora') ||
           nome.includes('condensadora') ||
           nome.includes('hi-wall') ||
           nome.includes('hiwall') ||
           nome.includes('climatizador') ||
           !!nome.match(/\b(btus?|btu\/h)\b/i) ||
           !!nome.match(/\b\d+k?\s*(btus?|btu\/h)?\b/i);
  };

  const chartData = useMemo(() => {
    // Agrupar vendas por marca
    const vendasPorMarca = data.reduce((acc, venda) => {
      const marca = identificarMarca(venda.item_nome || '');
      
      // Se for ar-condicionado mas marca não identificada, usar "Outras Marcas"
      let marcaFinal = marca;
      if (!marca) {
        const itemNome = venda.item_nome || '';
        
        // Se não identificou marca mas é ar-condicionado, colocar em "Outras Marcas"
        if (isArCondicionado(itemNome)) {
          marcaFinal = 'Outras Marcas';
        }
      }
      
      if (marcaFinal) {
        if (!acc[marcaFinal]) {
          acc[marcaFinal] = {
            marca: marcaFinal,
            quantidade: 0,
            valor: 0
          };
        }
        
        acc[marcaFinal].quantidade += 1;
        acc[marcaFinal].valor += venda.valor_venda;
      }
      
      return acc;
    }, {} as Record<string, { marca: string; quantidade: number; valor: number }>);

    // Converter para array e ordenar por quantidade
    return Object.values(vendasPorMarca)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10 marcas
  }, [data]);

  // Filtrar vendas da marca selecionada
  const vendasSelecionadas = useMemo(() => {
    if (!selectedMarca) return [];
    
    return data.filter(venda => {
      const marca = identificarMarca(venda.item_nome || '');
      
      if (selectedMarca === 'Outras Marcas') {
        // Se selecionou "Outras Marcas", mostrar vendas de ar-condicionado sem marca identificada
        if (!marca && isArCondicionado(venda.item_nome || '')) {
          return true;
        }
        return false;
      } else {
        // Para marcas específicas, usar a lógica original
        return marca === selectedMarca;
      }
    });
  }, [data, selectedMarca]);

  const handleBarClick = (data: any) => {
    if (data && data.marca) {
      setSelectedMarca(data.marca);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMarca(null);
  };

  const isDark = theme === 'dark';
  const accentColor = theme === 'dark' ? '#4299e1' : '#3182ce';

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="marca"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={11}
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
            cursor="pointer"
            onClick={handleBarClick}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={accentColor} />
            ))}            <LabelList 
              dataKey="quantidade" 
              position="top" 
              style={{ 
                fill: isDark ? '#f9fafb' : '#111827',
                fontSize: '11px',
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
      <MarcaDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        marca={selectedMarca || ''}
        vendas={vendasSelecionadas}
      />
    </div>
  );
};

export default TopMarcasBarChart;