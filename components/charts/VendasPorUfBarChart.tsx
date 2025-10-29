import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Venda } from '../../types';

interface VendasPorUfBarChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
}

const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#90cdf4', '#a0aec0', '#4fd1c5', '#f6ad55', '#fc8181', '#b794f4', '#718096'];

const VendasPorUfBarChart: React.FC<VendasPorUfBarChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    // FIX: Correctly type the accumulator of the reduce function. This allows TypeScript to infer the correct type for the accumulator (`acc`) and the result, resolving the error where `b.valor` was not found because `b` was of type `unknown`.
    const salesByUf = data.reduce((acc: { [key: string]: { name: string; valor: number } }, venda) => {
      const uf = venda.uf_pedido || 'N/A';
      if (!acc[uf]) {
        acc[uf] = { name: uf, valor: 0 };
      }
      acc[uf].valor += venda.valor_venda;
      return acc;
    }, {});

    return Object.values(salesByUf)
      // FIX: Explicitly type `a` and `b` in the sort function. `Object.values` can return `unknown[]`
      // for objects with index signatures, so this ensures TypeScript knows `valor` is a number.
      .sort((a: { valor: number }, b: { valor: number }) => b.valor - a.valor)
      .slice(0, 10); // Top 10 UFs
  }, [data]);

  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
          <YAxis stroke={tickColor} fontSize={12} tickFormatter={(value: number) => `R$${value/1000}k`} />
          <Tooltip 
            cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
            }}
            formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor Total']}
            />
          <Bar dataKey="valor" name="Valor Total" barSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
             <LabelList
                dataKey="valor"
                position="top"
                formatter={(value: number) => value.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short', currency: 'BRL', style: 'currency' })}
                style={{ fill: tickColor, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendasPorUfBarChart;