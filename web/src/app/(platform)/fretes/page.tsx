'use client';

import { useEffect, useState } from 'react';
import { Package, Clock, DollarSign } from 'lucide-react';

interface SimulationResult {
  carrier: string;
  price: number;
  days: number;
}

interface Simulation {
  id: string;
  originCep: string;
  destinationCep: string;
  weightKg: string;
  cargoValue: string;
  status: string;
  results: SimulationResult[] | null;
  createdAt: string;
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
}

export default function FretesPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    origin_cep: '',
    destination_cep: '',
    weight_kg: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    cargo_value: '',
  });
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSimulations();
  }, []);

  async function loadSimulations() {
    try {
      const res = await fetch('http://localhost:3000/freight/simulations', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSimulations(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      console.error('Erro ao carregar simulações');
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    setSimulating(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3000/freight/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          origin_cep: form.origin_cep,
          destination_cep: form.destination_cep,
          weight_kg: parseFloat(form.weight_kg),
          length_cm: parseFloat(form.length_cm),
          width_cm: parseFloat(form.width_cm),
          height_cm: parseFloat(form.height_cm),
          cargo_value: parseFloat(form.cargo_value),
        }),
      });
      if (res.ok) {
        setMessage('Simulação iniciada! Aguarde o processamento.');
        setTimeout(loadSimulations, 3000);
      }
    } catch {
      setMessage('Erro ao iniciar simulação');
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Simulação de Frete</h1>
        <p className="text-slate-400 text-sm mt-1">Calcule o custo de frete entre origens e destinos</p>
      </div>

      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Nova Simulação</h2>
        {message && (
          <div className="bg-blue-600/10 border border-blue-600/30 text-blue-400 text-sm px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}
        <form onSubmit={handleSimulate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'origin_cep', label: 'CEP de Origem', placeholder: '01310100' },
            { key: 'destination_cep', label: 'CEP de Destino', placeholder: '30130010' },
            { key: 'weight_kg', label: 'Peso (kg)', placeholder: '10' },
            { key: 'cargo_value', label: 'Valor da Carga (R$)', placeholder: '1000' },
            { key: 'length_cm', label: 'Comprimento (cm)', placeholder: '30' },
            { key: 'width_cm', label: 'Largura (cm)', placeholder: '20' },
            { key: 'height_cm', label: 'Altura (cm)', placeholder: '15' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-sm text-slate-400 mb-1.5 block">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                required
                className="w-full bg-[#0F172A] border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={simulating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {simulating ? 'Simulando...' : 'Simular Frete'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Histórico de Simulações</h2>
        {loading ? (
          <div className="text-slate-400 text-sm">Carregando...</div>
        ) : simulations.length === 0 ? (
          <div className="text-slate-400 text-sm">Nenhuma simulação realizada ainda</div>
        ) : (
          <div className="space-y-3">
            {simulations.map((sim) => (
              <div key={sim.id} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={14} className="text-blue-400" />
                    <span className="text-white font-medium">{sim.originCep} → {sim.destinationCep}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    sim.status === 'DONE' ? 'bg-green-600/20 text-green-400' :
                    sim.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                    sim.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>{sim.status}</span>
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  Peso: {sim.weightKg}kg • Valor: R$ {parseFloat(sim.cargoValue).toFixed(2)}
                </div>
                {sim.results && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sim.results.map((r, i) => (
                      <div key={i} className="bg-[#0F172A] rounded-lg p-3">
                        <div className="text-white text-sm font-medium">{r.carrier}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <DollarSign size={10} /> R$ {r.price?.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <Clock size={10} /> {r.days} dias
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
