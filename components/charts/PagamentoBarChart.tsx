import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Venda } from '../../types';

interface PagamentoBarChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
}

const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#90cdf4'];

const PagamentoBarChart: React.FC<PagamentoBarChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    const paymentCounts: { [key: string]: number } = {};
    data.forEach(venda => {
      let type = venda.detalhes_tipoPagamento;
      const lowerType = type.toLowerCase().trim();

      if (lowerType.includes('boleto')) {
        type = 'Boleto';
      } else if (lowerType.includes('pix')) {
        type = 'PIX';
      } else if (['visa', 'mastercard', 'elo', 'amex'].some(card => lowerType.includes(card)) || lowerType.includes('crédito') || lowerType.includes('credito')) {
        type = 'Cartão de Crédito';
      } else if (lowerType.includes('débito') || lowerType.includes('debito')) {
        type = 'Débito';
      }
      
      if (!paymentCounts[type]) {
        paymentCounts[type] = 0;
      }
      paymentCounts[type]++;
    });

    return Object.keys(paymentCounts).map(name => ({
      name,
      value: paymentCounts[name]
    })).sort((a, b) => b.value - a.value);
  }, [data]);
  
  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 10, right: 40, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <XAxis type="number" stroke={tickColor} fontSize={12} allowDecimals={false} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            stroke={tickColor} 
            fontSize={12} 
            interval={0} 
          />
          <Tooltip 
            cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
            }}
            formatter={(value: number) => [value, 'Nº de Vendas']}
            />
          <Bar dataKey="value" name="Nº de Vendas" barSize={35}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
                dataKey="value"
                position="right"
                style={{ fill: tickColor, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PagamentoBarChart;