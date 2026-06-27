'use client';

import { motion } from 'framer-motion';
import { Truck, BarChart3, Upload, Shield, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Simulação de Frete em Tempo Real',
    description: 'Compare preços de múltiplas transportadoras instantaneamente com cálculo automático de peso cúbico e ad valorem.',
  },
  {
    icon: Users,
    title: 'Multi-empresa',
    description: 'Gerencie múltiplas empresas com isolamento total de dados. Cada tenant tem seu próprio ambiente seguro.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard com Insights',
    description: 'Visualize indicadores estratégicos e receba insights automáticos sobre padrões de custo e concentração de rotas.',
  },
  {
    icon: Upload,
    title: 'Importação em Massa',
    description: 'Importe clientes e transportadoras via CSV ou XLSX. Processamento assíncrono com atualização em tempo real.',
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Autenticação com JWT, OAuth Google e GitHub, MFA/TOTP e proteção contra brute force.',
  },
  {
    icon: Clock,
    title: 'Histórico Completo',
    description: 'Mantenha registro de todas as simulações, imports e ações administrativas com auditoria completa.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Tudo que sua operação precisa
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Chega de planilhas e sistemas desconectados. O LogiSmart centraliza toda sua gestão logística.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 hover:border-blue-600/50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
