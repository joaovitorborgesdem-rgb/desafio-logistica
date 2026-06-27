'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />

      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">LogiSmart</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-slate-400 text-sm">
          <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#how" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
        </div>
        <a href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          Entrar
        </a>
      </nav>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-blue-600/20 text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-600/30">
            Plataforma SaaS de Logística
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Inteligência logística{' '}
            <span className="text-blue-400">em tempo real</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Simule fretes, gerencie transportadoras e tome decisões baseadas em dados.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href="/register" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Comece grátis <ArrowRight size={20} />
          </a>
          <a href="#how" className="flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Ver demonstração
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">40%</div>
            <div className="text-sm text-slate-400">Redução de custos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">3x</div>
            <div className="text-sm text-slate-400">Mais rápido</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-slate-400">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
