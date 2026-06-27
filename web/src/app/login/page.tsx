'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Email ou senha incorretos');
        return;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      router.push('/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">LogiSmart</span>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Entrar na plataforma</h1>
          <p className="text-slate-400 text-sm mb-6">Digite suas credenciais para acessar</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0F172A] border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0F172A] border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
