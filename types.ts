export interface User {
  id: string;
  email: string;
}

export interface Venda {
  id: number;
  valor_venda: number;
  data_venda: string; // ISO date string
  detalhes_tipoPagamento: string;
  id_pipedrive: number;
  nome_parceiro: string;
  item_nome?: string;
}

export interface CustomDateRange {
  startDate: string | null; // YYYY-MM-DD format
  endDate: string | null;   // YYYY-MM-DD format
}