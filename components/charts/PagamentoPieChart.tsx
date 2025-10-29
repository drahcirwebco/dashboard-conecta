import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Venda } from '../../types';

interface PagamentoPieChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
}

const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#90cdf4'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Não renderiza o rótulo se a fatia for muito pequena

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const PagamentoPieChart: React.FC<PagamentoPieChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    const paymentCounts: { [key: string]: number } = {};
    data.forEach(venda => {
      const type = venda.detalhes_tipoPagamento;
      if (!paymentCounts[type]) {
        paymentCounts[type] = 0;
      }
      paymentCounts[type]++;
    });

    return Object.keys(paymentCounts).map(name => ({
      name,
      value: paymentCounts[name]
    }));
  }, [data]);
  
  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
            }}
          />
          <Legend wrapperStyle={{fontSize: "12px", color: tickColor}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PagamentoPieChart;