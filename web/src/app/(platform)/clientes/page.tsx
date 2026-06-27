'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/clients', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Novo cliente
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1E293B] border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center text-slate-400 py-12">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-12">Nenhum cliente encontrado</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 text-xs font-medium px-6 py-3">NOME</th>
                <th className="text-left text-slate-400 text-xs font-medium px-6 py-3">EMAIL</th>
                <th className="text-left text-slate-400 text-xs font-medium px-6 py-3">TELEFONE</th>
                <th className="text-left text-slate-400 text-xs font-medium px-6 py-3">CIDADE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-white text-sm font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{client.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{client.phone ?? '-'}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{client.city ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
