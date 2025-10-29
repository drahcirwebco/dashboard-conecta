

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Venda } from '../../types';
import { parseRobust } from '../../utils/dateUtils';

interface VendasPorHorarioChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
}

const VendasPorHorarioChart: React.FC<VendasPorHorarioChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    // Inicializa um array com 24 posições (para cada hora do dia), todas com valor 0
    const salesByHour = Array.from({ length: 24 }, () => 0);

    data.forEach(venda => {
      const date = parseRobust(venda.data_venda);
      if (!date) return;
      
      const hour = date.getUTCHours(); // Extrai a hora correta em UTC
      salesByHour[hour]++; // Incrementa o contador para a hora correspondente
    });

    // Mapeia o array de contagem para o formato que o Recharts espera
    return salesByHour.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}h`, // Formata a hora como "00h", "01h", etc.
      count: count,
    }));
  }, [data]);

  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';
  const accentColor = theme === 'dark' ? '#4299e1' : '#3182ce';

  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <XAxis dataKey="hour" stroke={tickColor} fontSize={12} />
          <YAxis stroke={tickColor} fontSize={12} allowDecimals={false} label={{ value: 'Nº de Vendas', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 12 }}/>
          <Tooltip 
            cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
            }}
            formatter={(value: number) => [value, 'Nº de Vendas']}
            />
          <Bar dataKey="count" name="Nº de Vendas" fill={accentColor}>
            <LabelList
                dataKey="count"
                position="top"
                style={{ fill: tickColor, fontSize: 12 }}
                formatter={(value: number) => (value > 0 ? value : '')}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendasPorHorarioChart;