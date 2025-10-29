

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { Venda } from '../../types';
import { parseRobust } from '../../utils/dateUtils';

interface VendasAreaChartProps {
  data: Venda[];
  theme: 'light' | 'dark';
  dateRange: string;
}

// Componente de Tooltip customizado para corresponder ao design da imagem
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
      <div className={`p-3 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-dark-card border border-gray-700' : 'bg-light-card border border-gray-200'}`}>
        <p className="text-sm font-bold text-light-text dark:text-dark-text">{label}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-dark-accent' : 'text-light-accent'}`}>
          Valor : {formattedValue}
        </p>
      </div>
    );
  }
  return null;
};


const VendasAreaChart: React.FC<VendasAreaChartProps> = ({ data, theme, dateRange }) => {
  const chartData = useMemo(() => {
    
    // Lógica para a visão 'Este Mês': Exibe todos os dias do mês atual
    if (dateRange === 'month') {
        const salesByDate: { [key: string]: number } = {};
        data.forEach(venda => {
          const date = parseRobust(venda.data_venda);
          if (!date) return;
          const year = date.getUTCFullYear();
          if (year < 2000) return;
          const dateKey = `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
          if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
          salesByDate[dateKey] += venda.valor_venda;
        });

        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getUTCDate();
        const monthData = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const formattedDate = `${String(day).padStart(2, '0')} ${monthNames[currentMonth]}`;
            monthData.push({
                date: formattedDate,
                valor: salesByDate[dateKey] || 0,
            });
        }
        return monthData;
    }

    // Lógica para a visão 'Esta Semana': Exibe todos os dias da semana atual (Seg-Dom)
    if (dateRange === 'week') {
        const salesByDate: { [key: string]: number } = {};
        data.forEach(venda => {
            const date = parseRobust(venda.data_venda);
            if (!date) return;
            const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
            if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
            salesByDate[dateKey] += venda.valor_venda;
        });

        const now = new Date();
        const weekData = [];
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const dayOfWeek = today.getUTCDay();

        const startOfWeek = new Date(today);
        // Define o início para a Segunda-feira da semana atual
        startOfWeek.setUTCDate(today.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setUTCDate(startOfWeek.getUTCDate() + i);
            const year = day.getUTCFullYear();
            const month = day.getUTCMonth();
            const dateNum = day.getUTCDate();

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
            const formattedDate = `${dayNames[day.getUTCDay()]} ${String(dateNum).padStart(2, '0')}`;
            
            weekData.push({
                date: formattedDate,
                valor: salesByDate[dateKey] || 0
            });
        }
        return weekData;
    }

    // Lógica para a visão 'Período Completo': Agrega as vendas por mês/ano
    if (dateRange === 'all') {
        const salesByMonth: { [key: string]: number } = {};
        data.forEach(venda => {
            const date = parseRobust(venda.data_venda);
            if (!date) return;
            const year = date.getUTCFullYear();
            if (year < 2000) return;
            const month = date.getUTCMonth();
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; // Usa YYYY-MM para ordenação
            if (!salesByMonth[monthKey]) salesByMonth[monthKey] = 0;
            salesByMonth[monthKey] += venda.valor_venda;
        });

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        return Object.keys(salesByMonth)
            .sort()
            .map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                return {
                    date: `${monthNames[month - 1]}/${String(year).slice(-2)}`, // month é 1-indexado aqui
                    valor: salesByMonth[monthKey]
                };
            });
    }

    return [];
  }, [data, dateRange]);

  const tickColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';
  const accentColor = theme === 'dark' ? '#4299e1' : '#3182ce';
  const dotFillColor = theme === 'dark' ? '#1a202c' : '#ffffff';

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke={tickColor} fontSize={12} interval={'preserveStartEnd'} tickCount={15}/>
          <YAxis stroke={tickColor} fontSize={12} tickFormatter={(value: number) => `R$${value/1000}k`} />
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
          <Tooltip 
            content={<CustomTooltip theme={theme} />}
            cursor={{ stroke: tickColor, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke={accentColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValor)" 
            dot={{ r: 5, stroke: accentColor, fill: dotFillColor, strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: accentColor, fill: dotFillColor, strokeWidth: 2 }}
          >
             <LabelList 
                dataKey="valor" 
                position="top" 
                offset={12}
                style={{ fill: tickColor, fontSize: 12 }}
                formatter={(value: number) => 
                  // Só mostra o rótulo se o valor for maior que zero
                  value > 0 ? value.toLocaleString('pt-BR', { 
                      notation: 'compact', 
                      compactDisplay: 'short',
                      style: 'currency',
                      currency: 'BRL'
                    }) : ''
                }
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendasAreaChart;