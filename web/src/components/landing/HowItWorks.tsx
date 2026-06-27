'use client';

import { motion } from 'framer-motion';
import { UserPlus, Settings, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Crie sua conta',
    description: 'Cadastre sua empresa em minutos. Configure usuários com diferentes níveis de acesso: Admin, Manager e Operador.',
  },
  {
    icon: Settings,
    number: '02',
    title: 'Configure sua operação',
    description: 'Importe clientes e transportadoras via CSV. Defina suas rotas e parâmetros de cálculo de frete.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Tome decisões inteligentes',
    description: 'Simule fretes em tempo real, acompanhe o dashboard e receba insights automáticos para reduzir custos.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 bg-[#1E293B]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Como funciona</h2>
          <p className="text-slate-400 text-lg">Comece a usar em menos de 5 minutos</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-blue-600/50 to-transparent" />
              )}
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 border border-blue-600/30 rounded-2xl mb-6">
                <step.icon size={32} className="text-blue-400" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full text-xs font-bold text-white flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
