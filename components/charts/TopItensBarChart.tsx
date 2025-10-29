

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Venda } from '../../types';

interface TopItensBarChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
}

const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#90cdf4', '#a0aec0'];

const Y_AXIS_WIDTH = 200; // Define uma largura generosa para os rótulos

// Componente customizado para o rótulo do eixo Y que trunca textos longos
const CustomizedYAxisTick = (props: any) => {
    // Recharts passa as propriedades: x, y, stroke, fill, payload
    const { x, y, payload, fill } = props;

    const originalText = payload.value || '';
    const textToDisplay = originalText.length > 20 
        ? `${originalText.substring(0, 20)}...` 
        : originalText;

    // Altura suficiente para uma linha de texto, bem alinhada
    const textHeight = 45; 
    // `x` é a posição da linha do eixo. Desenhamos nossa caixa à esquerda dela.
    const finalX = x - Y_AXIS_WIDTH;
    // `y` é o centro vertical do rótulo. Ajustamos a posição da caixa para alinhá-la.
    const finalY = y - (textHeight / 2);

    return (
        <g transform={`translate(${finalX}, ${finalY})`}>
            <foreignObject width={Y_AXIS_WIDTH} height={textHeight}>
                <div 
                    xmlns="http://www.w3.org/1999/xhtml" 
                    style={{ 
                        fontSize: 12,
                        color: fill, // Usa a cor do tema passada por props
                        margin: 0,
                        paddingRight: '5px', // Pequeno espaçamento da linha do eixo
                        textAlign: 'right',
                        width: '100%',
                        lineHeight: '1.2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                    }}
                >
                    {textToDisplay}
                </div>
            </foreignObject>
        </g>
    );
};

// Componente de Tooltip customizado para mostrar detalhes do item
const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // O ponto de dado completo para a barra
    const formattedValue = data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
      <div className={`p-4 rounded-lg shadow-lg max-w-xs border ${theme === 'dark' ? 'bg-dark-card border-gray-700' : 'bg-light-card border-gray-200'}`}>
        <p className="text-sm font-bold text-light-text dark:text-dark-text break-words mb-2">{data.name}</p>
        <div className="space-y-1">
            <p className="text-sm text-light-text dark:text-dark-text">
            <strong>Valor Total:</strong> {formattedValue}
            </p>
            <p className="text-sm text-light-text dark:text-dark-text">
            <strong>Unidades Vendidas:</strong> {data.unidades.toLocaleString('pt-BR')}
            </p>
        </div>
      </div>
    );
  }
  return null;
};


const TopItensBarChart: React.FC<TopItensBarChartProps> = ({ data, theme }) => {
    const chartData = useMemo(() => {
    const salesByItem = data.reduce((acc: { [key: string]: { name: string; valor: number; unidades: number } }, venda) => {
        const itemName = venda.item_nome || 'Desconhecido';
        if (!acc[itemName]) {
        acc[itemName] = { name: itemName, valor: 0, unidades: 0 };
        }
        acc[itemName].valor += venda.valor_venda;
        acc[itemName].unidades += 1;
        return acc;
    }, {});

    return Object.values(salesByItem)
        // FIX: Explicitly type `a` and `b` in the sort function. `Object.values` can return `unknown[]`
        // for objects with index signatures, so this ensures TypeScript knows `valor` is a number.
        .sort((a: { valor: number }, b: { valor: number }) => b.valor - a.valor)
        .slice(0, 10); // Top 10 items
    }, [data]);

  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';
  
  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <XAxis type="number" stroke={tickColor} fontSize={12} tickFormatter={(value: number) => `R$${value/1000}k`}/>
          <YAxis 
            dataKey="name" 
            type="category" 
            width={Y_AXIS_WIDTH} 
            tickLine={false}
            axisLine={false}
            tick={<CustomizedYAxisTick />} // Usa o componente customizado para renderizar os rótulos
            interval={0}
            />
          <Tooltip 
            cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
            content={<CustomTooltip theme={theme} />}
            />
          <Bar dataKey="valor" name="Valor Total" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
                dataKey="valor"
                position="right"
                formatter={(value: number) => value.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short', currency: 'BRL', style: 'currency' })}
                style={{ fill: tickColor, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopItensBarChart;