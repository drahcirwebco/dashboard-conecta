import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { ChartBarIcon } from './icons/ChartBarIcon';
import type { User } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ao carregar o componente, verifica se há credenciais salvas no localStorage
    try {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      const rememberedPassword = localStorage.getItem('rememberedPassword');
      if (rememberedEmail && rememberedPassword) {
        setEmail(rememberedEmail);
        setPassword(rememberedPassword);
        setRememberMe(true);
      }
    } catch (error) {
        console.error("Falha ao ler dados do localStorage", error);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Gerencia o "Lembrar-me"
      if (rememberMe) {
        // ATENÇÃO: Salvar senhas no localStorage não é recomendado em ambientes de produção de alta segurança.
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Chama a função RPC 'login' criada no Supabase
      const { data, error: rpcError } = await supabase.rpc('login', {
        email_param: email,
        password_param: password,
      });

      if (rpcError) {
        throw rpcError;
      }

      // Verificação mais robusta da resposta da RPC.
      // A função deve retornar um array com um objeto de usuário em caso de sucesso.
      if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
        onLoginSuccess(data[0]);
      } else {
        setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
         <div className="flex items-center justify-center gap-3">
            <ChartBarIcon className="h-10 w-10 text-light-accent dark:text-dark-accent" />
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Conecta_E-commerce
            </h1>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-light-text dark:text-dark-text">
          Acesse seu painel
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-light-text dark:text-dark-text">
              Endereço de e-mail
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="block w-full rounded-md border-0 py-1.5 px-2 bg-gray-50 dark:bg-gray-700 text-light-text dark:text-dark-text shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-light-accent dark:focus:ring-dark-accent sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-light-text dark:text-dark-text">
                Senha
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="block w-full rounded-md border-0 py-1.5 px-2 bg-gray-50 dark:bg-gray-700 text-light-text dark:text-dark-text shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-light-accent dark:focus:ring-dark-accent sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label htmlFor="remember-me" className="flex items-center cursor-pointer select-none">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-gray-400 dark:border-gray-500 flex items-center justify-center flex-shrink-0
                            transition-colors duration-200
                            peer-checked:bg-light-accent peer-checked:border-light-accent
                            dark:peer-checked:bg-dark-accent dark:peer-checked:border-dark-accent
                            peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-light-accent 
                            dark:peer-focus:ring-offset-dark-card dark:peer-focus:ring-dark-accent
                            ">
                    <svg className="w-3 h-3 text-white hidden peer-checked:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <span className="ml-2 text-sm text-light-text dark:text-dark-text">
                    Lembrar-me
                </span>
            </label>
          </div>
          
          {error && (
            <div className="p-3 text-center text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/30 dark:text-red-300" role="alert">
                {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-light-accent px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-accent dark:bg-dark-accent dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;