'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Package, Users, Truck } from 'lucide-react';

interface Summary {
  total_simulations: number;
  simulations_this_month: number;
  avg_freight_value: number;
  most_used_carrier: string;
  top_origins: { city: string; count: number }[];
  top_destinations: { city: string; count: number }[];
}

interface Insight {
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [s, i] = await Promise.all([
          fetch('http://localhost:3000/dashboard/summary', { headers }).then((r) => r.json()),
          fetch('http://localhost:3000/dashboard/insights', { headers }).then((r) => r.json()),
        ]);
        setSummary(s);
        setInsights(i);
      } catch {
        console.error('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  const cards = [
    { label: 'Total de Simulações', value: summary?.total_simulations ?? 0, icon: Package, color: 'text-blue-400' },
    { label: 'Simulações este mês', value: summary?.simulations_this_month ?? 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Valor médio de carga', value: `R$ ${(summary?.avg_freight_value ?? 0).toFixed(2)}`, icon: Users, color: 'text-yellow-400' },
    { label: 'Transportadora mais usada', value: summary?.most_used_carrier ?? '-', icon: Truck, color: 'text-purple-400' },
  ];

  const severityColors: Record<string, string> = {
    info: 'border-blue-600/30 bg-blue-600/10 text-blue-400',
    warning: 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400',
    critical: 'border-red-600/30 bg-red-600/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral da sua operação logística</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Principais Origens</h2>
          {summary?.top_origins.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhuma simulação ainda</p>
          ) : (
            <ul className="space-y-2">
              {summary?.top_origins.map((o, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{o.city}</span>
                  <span className="text-blue-400 font-medium">{o.count} simulações</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Insights Automáticos</h2>
          {insights.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum insight disponível</p>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className={`border rounded-lg px-4 py-3 ${severityColors[insight.severity]}`}>
                  <div className="font-medium text-sm">{insight.title}</div>
                  <div className="text-xs mt-1 opacity-80">{insight.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
