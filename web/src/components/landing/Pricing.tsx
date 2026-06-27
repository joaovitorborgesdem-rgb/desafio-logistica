'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 299',
    period: '/mes',
    description: 'Ideal para pequenas operacoes',
    features: ['1 empresa', 'Ate 3 usuarios', '500 simulacoes/mes', 'Dashboard basico', 'Importacao CSV', 'Suporte por email'],
    cta: 'Comecar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 699',
    period: '/mes',
    description: 'Para operacoes em crescimento',
    features: ['Ate 5 empresas', 'Usuarios ilimitados', 'Simulacoes ilimitadas', 'Dashboard avancado + insights', 'Importacao CSV e XLSX', 'API access', 'Suporte prioritario'],
    cta: 'Assinar Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes operacoes logisticas',
    features: ['Empresas ilimitadas', 'Usuarios ilimitados', 'SLA garantido', 'Integracao customizada', 'Relatorios personalizados', 'Gerente de conta dedicado', 'Treinamento da equipe'],
    cta: 'Falar com vendas',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#0F172A]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Planos simples e transparentes</h2>
          <p className="text-slate-400 text-lg">Sem surpresas na fatura. Cancele quando quiser.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative rounded-2xl p-8 border ${plan.highlighted ? 'bg-blue-600 border-blue-500' : 'bg-[#1E293B] border-slate-700'}`}>
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <Check size={16} className={plan.highlighted ? 'text-blue-100' : 'text-blue-400'} />
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-300'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="/register" className={`block text-center py-3 rounded-xl font-semibold transition-colors ${plan.highlighted ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
