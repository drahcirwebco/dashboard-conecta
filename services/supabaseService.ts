

import { createClient } from '@supabase/supabase-js';
import type { Venda } from '../types';

// =================================================================================
// INSTRUÇÕES DE CONFIGURAÇÃO DO SUPABASE
// 1. A URL do seu projeto Supabase já foi configurada abaixo.
// 2. SUBSTITUA a string 'COLOQUE_SUA_CHAVE_ANON_AQUI' pela sua chave "anon" (pública) do Supabase.
//    Você pode encontrá-la no painel do seu projeto em: Settings -> API -> Project API keys
//
// 3. INSTRUÇÕES PARA LOGIN COM TABELA 'users_dash_conecta':
//    Execute os seguintes comandos no seu Editor de SQL no painel do Supabase.
//
//    -- I. Crie a tabela de usuários (se ainda não o fez):
//    CREATE TABLE public.users_dash_conecta (
//      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//      email TEXT UNIQUE NOT NULL,
//      password TEXT NOT NULL, -- IMPORTANTE: Em produção, nunca armazene senhas em texto plano. Use uma extensão como pgsodium para hash.
//      created_at TIMESTAMPTZ DEFAULT now()
//    );
//
//    -- II. Insira um usuário de teste (se ainda não o fez):
//    INSERT INTO public.users_dash_conecta (email, password)
//    VALUES ('teste@email.com', 'senha123');
//
//    -- III. Crie a função de login para verificar as credenciais:
//    CREATE OR REPLACE FUNCTION login(email_param TEXT, password_param TEXT)
//    RETURNS TABLE (id uuid, email TEXT) AS $$
//    BEGIN
//      RETURN QUERY
//      SELECT u.id, u.email FROM public.users_dash_conecta AS u
//      WHERE u.email = email_param AND u.password = password_param;
//    END;
//    $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// 4. HABILITAR REALTIME (Notificações em Tempo Real):
//    Para a notificação de novas vendas funcionar, você precisa habilitar a replicação
//    nas tabelas 'vendas_parceiro' e 'tabela_parceiros'.
//    Vá para "Database" -> "Replication" no painel do Supabase e habilite a replicação para essas tabelas.
// =================================================================================
const supabaseUrl = 'https://hjywghvhrobmohvosmuu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXdnaHZocm9ibW9odm9zbXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODA4NDMsImV4cCI6MjA2MzI1Njg0M30.rCki-r8y7cEoNe111QIZhRhyvsU5lmCP9hUx5bjLqEw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getVendas = async (): Promise<Venda[]> => {
  try {
    const { data, error } = await supabase
      .from('vendas_parceiro')
      .select('*')
      .order('data_venda', { ascending: false });

    if (error) {
      throw error;
    }

    // Log para diagnóstico - mostrar vendas com parceiro vazio
    if (data) {
      const vendasSemParceiro = data.filter(v => !v.nome_parceiro || v.nome_parceiro.trim() === '');
      if (vendasSemParceiro.length > 0) {
        console.warn(`⚠️ Encontradas ${vendasSemParceiro.length} vendas SEM nome de parceiro:`);
        console.table(vendasSemParceiro.map(v => ({
          id: v.id,
          data_venda: v.data_venda,
          valor_venda: v.valor_venda,
          nome_parceiro: v.nome_parceiro || '(vazio)',
          detalhes_tipoPagamento: v.detalhes_tipoPagamento,
          id_pipedrive: v.id_pipedrive
        })));
        
        // Copia um JSON para facilitar análise
        const jsonVendas = JSON.stringify(vendasSemParceiro.map(v => ({
          id: v.id,
          data: v.data_venda,
          valor: v.valor_venda,
          pagamento: v.detalhes_tipoPagamento,
          pipedrive: v.id_pipedrive
        })), null, 2);
        console.log('JSON das vendas sem parceiro para análise:', jsonVendas);
      }
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};