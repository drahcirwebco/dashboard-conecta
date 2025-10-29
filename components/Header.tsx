import React from 'react';
import ThemeToggle from './ThemeToggle';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import type { User, Venda } from '../types';
import NewSaleToast from './NewSaleToast';
import { DownloadIcon } from './icons/DownloadIcon';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  onExport: () => void;
  user: User | null;
  latestSale: Venda | null;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onLogout, onExport, user, latestSale }) => {
  const getUserName = (email: string | undefined): string => {
    if (!email) return 'Usuário';
    const namePart = email.split('@')[0];
    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const userName = getUserName(user?.email);

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="h-8 w-8 text-light-accent dark:text-dark-accent" />
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            Conecta_E-commerce
          </h1>
           {user && (
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Olá, {userName} tenha um excelente dia :)
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
             {latestSale && <NewSaleToast sale={latestSale} />}
        </div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button
          onClick={onExport}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Exportar Relatório"
        >
          <DownloadIcon className="h-6 w-6" />
        </button>
        <button
          onClick={onLogout}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Sair"
        >
          <LogoutIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;