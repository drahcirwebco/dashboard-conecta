

import React, { useState, useEffect, useMemo } from 'react';
import { getVendas, supabase } from './services/supabaseService';
import type { Venda, User, CustomDateRange } from './types';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import ParceirosAtivosKpi from './components/ParceirosAtivosKpi';
import VendasAreaChart from './components/charts/VendasAreaChart';
import ParceirosBarChart from './components/charts/ParceirosBarChart';
import PagamentoBarChart from './components/charts/PagamentoBarChart';
import VendasPorTipoMaquina from './components/charts/VendasPorTipoMaquina';
import TopMarcasBarChart from './components/charts/TopMarcasBarChart';
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
  const [dateRange, setDateRange] = useState<string>('all'); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: null,
    endDate: null
  });
  
  // Wrapper para mudança de período
  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
  };
  
  // Handler para mudança de data personalizada
  const handleCustomDateRangeChange = (newRange: CustomDateRange) => {
    setCustomDateRange(newRange);
  };
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
        const vendasData = await getVendas();
        
        // Normaliza os nomes dos parceiros
        const normalizedVendas = vendasData.map(venda => ({
          ...venda,
          nome_parceiro: venda.nome_parceiro ? normalizeParceiroName(venda.nome_parceiro) : venda.nome_parceiro
        }));
        
        setVendas(normalizedVendas);
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
          const newSale = payload.new as Venda;
          
          // Normaliza o nome do parceiro se existir
          if (newSale.nome_parceiro) {
            newSale.nome_parceiro = normalizeParceiroName(newSale.nome_parceiro);
          }
          
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

    // Função para normalizar nomes de parceiros
    const normalizeParceiroName = (name: string): string => {
        return name
            .toUpperCase() // Converte para maiúscula
            .trim() // Remove espaços no início e fim
            .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
            // Normaliza acentos e caracteres especiais
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            // Padronizações específicas comuns
            .replace(/[ÇĆĈĊČ]/g, 'C')
            .replace(/[ÀÁÂÃÄÅ]/g, 'A')
            .replace(/[ÈÉÊË]/g, 'E')
            .replace(/[ÌÍÎÏ]/g, 'I')
            .replace(/[ÒÓÔÕÖ]/g, 'O')
            .replace(/[ÙÚÛÜ]/g, 'U')
            .replace(/[ÑŃŅŇŉ]/g, 'N')
            // Remove caracteres especiais restantes exceto letras, números e espaços
            .replace(/[^\w\s]/g, '')
            .trim(); // Trim final para garantir
    };

    const allParceiroNames = useMemo(() => {
        const partnerNames = vendas
          .map(v => v.nome_parceiro)
          .filter((name): name is string => !!name) // Garante que não há nulos ou vazios
          .map(name => normalizeParceiroName(name)) // Normaliza com função robusta
          .filter(name => name !== 'WEBCO PECAS'); // Exclui WEBCO PECAS da lista de parceiros
        // Remove duplicatas e ordena
        return [...new Set(partnerNames)].sort((a: string, b: string) => a.localeCompare(b));
    }, [vendas]);


    const filteredVendas = useMemo(() => {
        // Primeiro, exclui parceiro WEBCO PECAS de toda análise
        let filtered = vendas.filter(venda => {
            if (!venda.nome_parceiro) return true;
            const normalizedParceiroName = normalizeParceiroName(venda.nome_parceiro);
            return normalizedParceiroName !== 'WEBCO PECAS';
        });

        // Segundo, filtra por parceiro selecionado
        filtered = selectedParceiroNames.length === 0
            ? filtered
            : filtered.filter(venda => {
                if (!venda.nome_parceiro) return false;
                // Normaliza o nome do parceiro da venda para comparação
                const normalizedParceiroName = normalizeParceiroName(venda.nome_parceiro);
                return selectedParceiroNames.includes(normalizedParceiroName);
            });

        // Terceiro, filtra por período
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

                if (dateRange === 'custom') {
                    // Filtro personalizado usando as datas selecionadas
                    if (customDateRange.startDate || customDateRange.endDate) {
                        let isInRange = true;
                        
                        if (customDateRange.startDate) {
                            const startDate = new Date(customDateRange.startDate + 'T00:00:00.000Z');
                            isInRange = isInRange && cleanVendaDate >= startDate;
                        }
                        
                        if (customDateRange.endDate) {
                            const endDate = new Date(customDateRange.endDate + 'T23:59:59.999Z');
                            isInRange = isInRange && cleanVendaDate <= endDate;
                        }
                        
                        return isInRange;
                    }
                    // Se não há datas definidas, mostra todas as vendas
                    return true;
                }

                // Para qualquer outro valor de dateRange, não filtra
                return true;
            });
        }
        
        // Finalmente, ordena o resultado para garantir que esteja sempre em ordem cronológica decrescente.
        // Isso é crucial porque a ordenação do banco de dados em uma coluna de TEXTO não é confiável.
        const result = [...filtered].sort((a, b) => {
            const dateA = parseRobust(a.data_venda);
            const dateB = parseRobust(b.data_venda);
            
            // Lida com casos em que as datas podem ser inválidas
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // Coloca 'b' antes de 'a'
            if (!dateB) return -1; // Coloca 'a' antes de 'b'
            
            return dateB.getTime() - dateA.getTime();
        });
        
        // Força uma nova referência do array para garantir re-renderização
        return [...result];

    }, [vendas, selectedParceiroNames, dateRange, customDateRange]);
  
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
        <div className="text-2xl font-semibold">Carregando dados...</div>
      </div>
    );
  }

  // Debug: Mostrar vendas sem parceiro
  const vendasSemParceiro = vendas.filter(v => !v.nome_parceiro || v.nome_parceiro.trim() === '');
  if (vendasSemParceiro.length > 0 && user) {
    console.log('=== VENDAS SEM PARCEIRO ===');
    console.table(vendasSemParceiro.map(v => ({
      id: v.id,
      data: v.data_venda,
      valor: `R$ ${v.valor_venda.toFixed(2)}`,
      pagamento: v.detalhes_tipoPagamento,
      pipedrive_id: v.id_pipedrive
    })));
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
        onDateRangeChange={handleDateRangeChange}
        customDateRange={customDateRange}
        onCustomDateRangeChange={handleCustomDateRangeChange}
      />
      <main className="p-4 sm:p-6 lg:p-8 pt-0">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Valor Total" value={kpiData.totalRevenue} format="currency" />
          <KpiCard title="Ticket Médio" value={kpiData.avgTicket} format="currency" />
          <KpiCard title="Total de Vendas" value={kpiData.totalSales} />
          <ParceirosAtivosKpi data={filteredVendas} dateRange={dateRange} />
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

            {/* --- Linha 3: Top Itens e Top Marcas --- */}
            {/* --- Linha 3: Top Itens Vendidos (largura total) --- */}
            <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Top Itens Vendidos</h3>
                <TopItensBarChart data={filteredVendas} theme={theme} />
            </div>

            {/* --- Linha 4: Top Marcas (2 colunas) e Vendas por Tipo de Máquina (1 coluna) --- */}
            <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                    Top Marcas ({filteredVendas.length} vendas)
                </h3>
                <TopMarcasBarChart 
                    key={`marcas-${filteredVendas.length}-${dateRange}`}
                    data={filteredVendas} 
                    theme={theme} 
                />
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">
                    Vendas por Tipo de Máquina ({filteredVendas.length} vendas)
                </h3>
                <VendasPorTipoMaquina 
                    key={`tipos-${filteredVendas.length}-${dateRange}`}
                    data={filteredVendas} 
                    theme={theme} 
                />
            </div>
            
            {/* --- Linha 5: Vendas Recentes (Pleine largeur) --- */}
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