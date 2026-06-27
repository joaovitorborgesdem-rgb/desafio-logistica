'use client';

import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-slate-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">LogiSmart</span>
          </div>

          <div className="flex items-center gap-8 text-slate-400 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#how" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
            <a href="/login" className="hover:text-white transition-colors">Entrar</a>
          </div>

          <p className="text-slate-500 text-sm">
            © 2026 LogiSmart. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
