# 📊 Dashboard de Análise de Vendas - Conecta

Um dashboard moderno e responsivo para análise de vendas, desenvolvido com React, TypeScript e Recharts. O sistema oferece visualizações interativas e insights detalhados sobre performance de vendas.

## ✨ Funcionalidades

### 📈 Análise de Vendas
- **Gráfico de Área de Vendas**: Visualização temporal das vendas com filtros por período
- **Vendas por Horário**: Análise do comportamento de vendas ao longo do dia
- **Vendas por UF**: Distribuição geográfica das vendas por estado brasileiro
- **Top Itens**: Ranking dos produtos mais vendidos

### 💰 Análise de Pagamentos
- **Gráfico de Barras de Pagamento**: Comparação de métodos de pagamento
- **Gráfico Pizza de Pagamento**: Distribuição percentual dos tipos de pagamento

### 🤝 Análise de Parceiros
- **Performance de Parceiros**: Análise detalhada do desempenho de cada parceiro
- **Relatórios de Parceiros**: Modal com informações completas e opção de download

### 📊 KPIs e Métricas
- **Cards de KPI**: Indicadores principais como receita total, número de vendas, ticket médio
- **Vendas Recentes**: Tabela com as últimas transações
- **Detalhes de Venda**: Modal com informações completas de cada transação

### 🎨 Interface e Experiência
- **Tema Claro/Escuro**: Alternância entre modos de visualização
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Filtros Avançados**: Filtros por data, parceiro, método de pagamento e status
- **Notificações**: Toast de novas vendas em tempo real
- **Sistema de Login**: Autenticação segura

### 🔧 Recursos Técnicos
- **Integração com Supabase**: Backend como serviço para dados
- **Exportação de Dados**: Download de relatórios em formato Excel/CSV
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Recharts**: Biblioteca de gráficos moderna e customizável
- **Vite**: Build tool rápido e otimizado

## 🛠 Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Gráficos**: Recharts
- **Backend**: Supabase
- **Estilização**: CSS Modules + Tailwind CSS
- **Ícones**: Componentes SVG customizados

## 🚀 Como Executar

**Pré-requisitos:** Node.js 16+

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/drahcirwebco/dashboard-conecta.git
   cd dashboard-conecta
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env.local`
   - Adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Execute o projeto**:
   ```bash
   npm run dev
   ```

5. **Acesse o dashboard**:
   Abra [http://localhost:5173](http://localhost:5173) no seu navegador

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── charts/          # Gráficos e visualizações
│   ├── icons/           # Ícones SVG customizados
│   ├── FilterBar.tsx    # Barra de filtros
│   ├── Header.tsx       # Cabeçalho da aplicação
│   ├── KpiCard.tsx      # Cards de indicadores
│   └── ...
├── hooks/               # Custom hooks
├── services/            # Serviços de API
├── utils/               # Utilitários e helpers
└── types.ts            # Definições de tipos TypeScript
```

## 🎯 Próximas Funcionalidades

- [ ] Relatórios automatizados por email
- [ ] Dashboard de previsão de vendas
- [ ] Integração com mais plataformas de pagamento
- [ ] Análise de sazonalidade
- [ ] Comparativo year-over-year
- [ ] Alertas personalizáveis

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Squad de Automação & IA
