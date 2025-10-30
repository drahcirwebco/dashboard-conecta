
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import type { CustomDateRange } from '../types';

interface FilterBarProps {
  parceiroNames: string[];
  selectedParceiroNames: string[];
  onSelectionChange: (selected: string[]) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customDateRange: CustomDateRange;
  onCustomDateRangeChange: (range: CustomDateRange) => void;
}

const DateRangeSelector: React.FC<{
  selectedRange: string;
  onRangeChange: (range: string) => void;
  customDateRange: CustomDateRange;
  onCustomDateRangeChange: (range: CustomDateRange) => void;
}> = ({ selectedRange, onRangeChange, customDateRange, onCustomDateRangeChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  const ranges = [
    { key: 'all', label: 'Período Completo' },
    { key: 'week', label: 'Esta Semana' },
    { key: 'month', label: 'Este Mês' },
    { key: 'custom', label: 'Personalizado' },
  ];

  const handleRangeChange = (key: string) => {
    onRangeChange(key);
    if (key === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newRange = {
      ...customDateRange,
      [field]: value || null
    };
    onCustomDateRangeChange(newRange);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-dark-card p-1 rounded-lg shadow-inner">
        {ranges.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleRangeChange(key)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:ring-offset-2 dark:focus:ring-offset-dark-bg
              ${
                selectedRange === key
                  ? 'bg-white dark:bg-gray-700 text-light-accent dark:text-dark-accent shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Seletor de data personalizado */}
      {(selectedRange === 'custom' || showCustomPicker) && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              De:
            </label>
            <input
              type="date"
              value={customDateRange.startDate || ''}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Até:
            </label>
            <input
              type="date"
              value={customDateRange.endDate || ''}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({ parceiroNames, selectedParceiroNames, onSelectionChange, dateRange, onDateRangeChange, customDateRange, onCustomDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (parceiroName: string) => {
    const newSelection = selectedParceiroNames.includes(parceiroName)
      ? selectedParceiroNames.filter(name => name !== parceiroName)
      : [...selectedParceiroNames, parceiroName];
    onSelectionChange(newSelection);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };
  
  const getButtonLabel = () => {
    if (selectedParceiroNames.length === 0) {
      return 'Todos os Parceiros';
    }
    if (selectedParceiroNames.length === 1) {
      return selectedParceiroNames[0];
    }
    return `${selectedParceiroNames.length} Parceiros Selecionados`;
  };

  return (
    <div className="p-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-4 sm:gap-6">
        <div ref={wrapperRef} className="relative inline-block text-left w-full max-w-xs z-20">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-light-card dark:bg-dark-card text-sm font-medium text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-dark-bg focus:ring-light-accent"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={handleToggle}
                >
                    <span className="truncate">{getButtonLabel()}</span>
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute left-0 mt-2 w-full rounded-md shadow-lg bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                       <div className="px-4 py-2 flex justify-end">
                           <button onClick={clearSelection} className="text-xs text-light-accent dark:text-dark-accent hover:underline">
                               Limpar Seleção
                           </button>
                       </div>
                        {parceiroNames.map(name => (
                            <div key={name} className="flex items-center px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                                <input
                                    id={`checkbox-${name}`}
                                    type="checkbox"
                                    checked={selectedParceiroNames.includes(name)}
                                    onChange={() => handleCheckboxChange(name)}
                                    className="h-4 w-4 rounded border-gray-300 text-light-accent focus:ring-light-accent"
                                />
                                <label htmlFor={`checkbox-${name}`} className="ml-3 min-w-0 flex-1 cursor-pointer">
                                    {name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <DateRangeSelector 
          selectedRange={dateRange} 
          onRangeChange={onDateRangeChange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={onCustomDateRangeChange}
        />
    </div>
  );
};

export default FilterBar;
