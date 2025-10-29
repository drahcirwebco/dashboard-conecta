

import React, { useState, useEffect, useMemo } from 'react';
import { fetchVendas, supabase } from './services/supabaseService';
import type { Venda, User } from './types';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import VendasAreaChart from './components/charts/VendasAreaChart';
import ParceirosBarChart from './components/charts/ParceirosBarChart';
import PagamentoBarChart from './components/charts/PagamentoBarChart';
import RecentSalesTable from './components/RecentSalesTable';
import { useTheme } from './hooks/useTheme';
import SaleDetailModal from './components/SaleDetailModal';
import FilterBar from './components/FilterBar';
import Login from './components/Login';
import { parseRobust } from './utils/dateUtils';
import TopItensBarChart from './components/charts/TopItensBarChart';
import PartnerReportModal from './components/PartnerReportModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Venda | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const [selectedParceiroNames, setSelectedParceiroNames] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('month'); // 'all', 'week', 'month'
  const [latestSale, setLatestSale] = useState<Venda | null>(null);

  useEffect(() => {
    // Verificar se há um usuário logado no sessionStorage ao carregar o app
    try {
      const loggedInUser = sessionStorage.getItem('user');
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('user');
    }
    setAuthLoading(false);
  }, []);


  useEffect(() => {
    if (!user) return; // Não carrega os dados se não houver usuário logado

    const loadData = async () => {
      try {
        setLoading(true);
        const vendasData = await fetchVendas();
        setVendas(vendasData);
        setError(null);
      } catch (err) {
        let errorMessage = 'Falha ao carregar os dados. Verifique sua conexão e se as políticas de RLS (Row Level Security) estão habilitadas para leitura nas tabelas.';
        if (err instanceof Error) {
            if (err.message.includes('JWT')) {
                 errorMessage = 'Chave de API do Supabase ausente ou inválida. Por favor, adicione sua chave "anon" no arquivo `services/supabaseService.ts`.';
            }
        }
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
     // Configura a escuta de eventos em tempo real para novas vendas
    const salesChannel = supabase.channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vendas_parceiro' },
        (payload) => {
          console.log('Nova venda recebida!', payload);
          const newSale = payload.new as Venda;
          // Adiciona a nova venda ao topo da lista para atualização imediata da UI
          setVendas(currentVendas => [newSale, ...currentVendas]);
          // Define a venda mais recente para acionar a notificação
          setLatestSale(newSale);
        }
      )
      .subscribe();

    // Função de limpeza para remover a inscrição ao desmontar o componente
    return () => {
      supabase.removeChannel(salesChannel);
    };
  }, [user]);

  // Efeito para limpar a notificação de nova venda após 5 segundos
  useEffect(() => {
    if (latestSale) {
      const timer = setTimeout(() => {
        setLatestSale(null);
      }, 5000); // A notificação desaparecerá após 5 segundos
      return () => clearTimeout(timer);
    }
  }, [latestSale]);

    const allParceiroNames = useMemo(() => {
        const partnerNames = vendas
          .map(v => v.nome_parceiro)
          .filter((name): name is string => !!name); // Garante que não há nulos ou vazios
        // FIX: Explicitly type `a` and `b` to `string` to resolve error where TypeScript infers them as `unknown`.
        return [...new Set(partnerNames)].sort((a: string, b: string) => a.localeCompare(b));
    }, [vendas]);


    const filteredVendas = useMemo(() => {
        // Primeiro, filtra por parceiro
        let filtered = selectedParceiroNames.length === 0
            ? vendas
            : vendas.filter(venda => venda.nome_parceiro && selectedParceiroNames.includes(venda.nome_parceiro));

        // Segundo, filtra por período
        if (dateRange !== 'all') {
            const now = new Date();
            const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

            filtered = filtered.filter(venda => {
                const vendaDate = parseRobust(venda.data_venda);
                if (!vendaDate) return false;

                // Normaliza a data da venda para meia-noite UTC para comparações de dia inteiro
                const cleanVendaDate = new Date(Date.UTC(vendaDate.getUTCFullYear(), vendaDate.getUTCMonth(), vendaDate.getUTCDate()));
                
                if (dateRange === 'week') {
                    const dayOfWeek = today.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.
                    const startOfWeek = new Date(today);
                    startOfWeek.setUTCDate(today.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for Sunday
                    startOfWeek.setUTCHours(0, 0, 0, 0);
                    return cleanVendaDate >= startOfWeek;
                }

                if (dateRange === 'month') {
                    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
                    return cleanVendaDate >= startOfMonth;
                }

                return true;
            });
        }
        
        // Finalmente, ordena o resultado para garantir que esteja sempre em ordem cronológica decrescente.
        // Isso é crucial porque a ordenação do banco de dados em uma coluna de TEXTO não é confiável.
        return [...filtered].sort((a, b) => {
            const dateA = parseRobust(a.data_venda);
            const dateB = parseRobust(b.data_venda);
            
            // Lida com casos em que as datas podem ser inválidas
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // Coloca 'b' antes de 'a'
            if (!dateB) return -1; // Coloca 'a' antes de 'b'
            
            return dateB.getTime() - dateA.getTime();
        });

    }, [vendas, selectedParceiroNames, dateRange]);
  
  const topParceirosData = useMemo(() => {
    const salesByPartner = filteredVendas.reduce((acc, venda) => {
      const partnerName = venda.nome_parceiro || 'N/A';
      if (!acc[partnerName]) {
        acc[partnerName] = 0;
      }
      acc[partnerName] += venda.valor_venda;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByPartner)
      .map(([name, total]) => ({
        nome_parceiro: name,
        valor_total_parceiro: total as number,
      }))
      .sort((a, b) => b.valor_total_parceiro - a.valor_total_parceiro);
  }, [filteredVendas]);


  const kpiData = useMemo(() => {
    if (!filteredVendas.length) {
      return { totalRevenue: 0, avgTicket: 0, totalSales: 0 };
    }
    const totalRevenue = filteredVendas.reduce((acc, v) => acc + v.valor_venda, 0);
    const totalSales = filteredVendas.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return { totalRevenue, avgTicket, totalSales };
  }, [filteredVendas]);
  
  const handleLoginSuccess = (loggedInUser: User) => {
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    // Limpa os dados para evitar que o próximo usuário veja dados antigos
    setVendas([]); 
  };

  if (authLoading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="text-2xl font-semibold">Verificando sessão...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="text-2xl font-semibold">Carregando Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 text-red-700 dark:text-red-300 p-4">
        <div className="text-center max-w-2xl bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-2xl border border-red-200 dark:border-red-800">
            <h2 className="text-2xl font-bold mb-4 text-red-800 dark:text-red-200">Ocorreu um Erro ao Carregar o Dashboard</h2>
            <p className="text-lg text-light-text dark:text-dark-text p-4 rounded-md bg-red-100 dark:bg-red-900/50">
                {error}
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme}`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onLogout={handleLogout} 
        user={user} 
        latestSale={latestSale}
        onExport={() => setIsReportModalOpen(true)}
      />
      <FilterBar 
        parceiroNames={allParceiroNames} 
        selectedParceiroNames={selectedParceiroNames} 
        onSelectionChange={setSelectedParceiroNames}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <main className="p-4 sm:p-6 lg:p-8 pt-0">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KpiCard title="Valor Total" value={kpiData.totalRevenue} format="currency" />
          <KpiCard title="Ticket Médio" value={kpiData.avgTicket} format="currency" />
          <KpiCard title="Total de Vendas" value={kpiData.totalSales} />
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- Linha 1: Vendas ao Longo do Tempo (Pleine largeur) --- */}
            <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Vendas ao Longo do Tempo</h3>
                <VendasAreaChart data={filteredVendas} theme={theme} dateRange={dateRange} />
            </div>

            {/* --- Linha 2: Parceiros e Pagamento --- */}
            <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Top Parceiros por Valor</h3>
                <ParceirosBarChart data={topParceirosData} theme={theme} />
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Vendas por Pagamento</h3>
                <PagamentoBarChart data={filteredVendas} theme={theme} />
            </div>

            {/* --- Linha 3: Top Itens (Pleine largeur) --- */}
            <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Top Itens Vendidos</h3>
                <TopItensBarChart data={filteredVendas} theme={theme} />
            </div>
            
            {/* --- Linha 4: Vendas Recentes (Pleine largeur) --- */}
            <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md overflow-x-auto">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Vendas Recentes</h3>
                <RecentSalesTable data={filteredVendas.slice(0, 10)} onRowClick={setSelectedSale} />
            </div>
        </div>
      </main>
      {selectedSale && (
        <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
      {isReportModalOpen && (
        <PartnerReportModal
          onClose={() => setIsReportModalOpen(false)}
          kpiData={kpiData}
          vendas={filteredVendas}
          selectedParceiroNames={selectedParceiroNames}
          dateRange={dateRange}
        />
      )}
    </div>
  );
};

export default App;