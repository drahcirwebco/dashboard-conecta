import React, { useState, useEffect } from 'react';
import type { Venda } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface NewSaleToastProps {
  sale: Venda;
}

const NewSaleToast: React.FC<NewSaleToastProps> = ({ sale }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Adiciona um pequeno atraso para a animação de entrada funcionar corretamente no mounting
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const formattedValue = sale.valor_venda.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div
      className={`absolute bottom-full mb-2 right-0 flex items-center gap-3 w-max max-w-xs p-3 rounded-lg shadow-lg bg-green-100 dark:bg-green-900/80 backdrop-blur-sm border border-green-200 dark:border-green-700 transition-all duration-500 ease-in-out transform
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      role="alert"
    >
      <SparklesIcon className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-bold text-green-800 dark:text-green-200">
          Nova Venda!
        </p>
        <p className="text-green-700 dark:text-green-300">
          <span className="font-semibold">{sale.nome_parceiro}</span> vendeu {formattedValue}.
        </p>
      </div>
    </div>
  );
};

export default NewSaleToast;
