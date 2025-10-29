import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface ChartData {
  nome_parceiro: string;
  valor_total_parceiro: number;
}
interface ParceirosBarChartProps {
  data: ChartData[];
  theme: 'light' | 'dark';
}

const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#90cdf4', '#a0aec0'];

// Componente de rótulo customizado para posicionamento inteligente
const renderCustomizedLabel = (props: any, tickColor: string) => {
    const { x, y, width, height, value } = props;
    
    // Formata o valor de forma compacta (ex: 10k, 1M)
    const formattedValue = `R$ ${value.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' })}`;

    // Define um limite de largura para decidir se o rótulo vai dentro ou fora da barra
    const textWidthThreshold = 60; 

    // Se a barra for muito curta, renderiza o rótulo do lado de fora
    if (width < textWidthThreshold) {
        return (
            <text x={x + width + 5} y={y + height / 2} fill={tickColor} textAnchor="start" dominantBaseline="middle" fontSize={12}>
                {formattedValue}
            </text>
        );
    }

    // Se a barra for longa o suficiente, renderiza o rótulo dentro com cor de destaque
    return (
        <text x={x + width - 8} y={y + height / 2} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight="bold">
            {formattedValue}
        </text>
    );
};


const ParceirosBarChart: React.FC<ParceirosBarChartProps> = ({ data, theme }) => {
  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';
  
  // Limita os dados aos top 15 parceiros para uma visualização mais limpa
  const chartData = data.slice(0, 15);

  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 10, right: 70, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <XAxis type="number" stroke={tickColor} fontSize={12} tickFormatter={(value: number) => `R$${value/1000}k`}/>
          <YAxis dataKey="nome_parceiro" type="category" width={120} stroke={tickColor} fontSize={12} interval={0} />
          <Tooltip 
            cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
              borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
            }}
            formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor Total']}
            />
          <Bar dataKey="valor_total_parceiro" name="Valor Total Parceiro" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
                dataKey="valor_total_parceiro"
                content={(props) => renderCustomizedLabel(props, tickColor)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ParceirosBarChart;