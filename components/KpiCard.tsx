
import React from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  format?: 'currency' | 'number';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, format = 'number' }) => {
  const formattedValue = format === 'currency'
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : value.toLocaleString('pt-BR');

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md transition-transform hover:scale-105 duration-300">
      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-2">
        {formattedValue}
      </p>
    </div>
  );
};

export default KpiCard;
