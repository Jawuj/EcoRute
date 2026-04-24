import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Building2, Map as MapIcon, Users, ArrowUpRight } from 'lucide-react';

export function AdminView() {
  const stats = [
    { label: 'Total Recolectado', value: '1,240 kg', icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'CO2 Ahorrado', value: '342 kg', icon: Leaf, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Ciudadanos Activos', value: '850', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Rutas Completadas', value: '124', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Panel Estratégico</h2>
          <p className="text-gray-400 font-medium">Métricas de impacto y monitoreo en tiempo real.</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sistema Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-8 group hover:border-white/20 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={28} />
              </div>
              <ArrowUpRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-4xl font-black mt-2 tracking-tighter text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <MapIcon className="text-yellow-500" size={24} />
              Mapa de Calor: Medellín
            </h3>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-lg border border-red-500/30">Comuna 10 Crítica</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-lg border border-green-500/30">Comuna 14 Controlada</span>
            </div>
          </div>
          
          <div className="aspect-video bg-black/40 border border-white/5 rounded-[2rem] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-40">
              <div className="w-full h-full bg-[radial-gradient(circle_at_35%_45%,#fbbf24_0%,transparent_35%),radial-gradient(circle_at_65%_75%,#fbbf24_0%,transparent_25%),radial-gradient(circle_at_20%_80%,#fbbf24_0%,transparent_20%)] animate-pulse" />
            </div>
            <div className="z-10 text-center space-y-4">
              <MapIcon size={80} className="text-yellow-500/20 mx-auto" />
              <p className="text-xs text-gray-500 uppercase font-bold tracking-[0.3em]">Interfaz de Monitoreo Geoespacial</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-10 flex flex-col items-center text-center justify-between bg-yellow-500/5 group">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Impacto La Pradera</h3>
            <div className="h-1 w-12 bg-yellow-500 mx-auto" />
          </div>

          <div className="relative py-10">
            <svg className="w-48 h-48 -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-yellow-500" strokeDasharray="552.92" strokeDashoffset="110.58" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white">82%</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">General</span>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <p className="text-lg font-black text-white tracking-widest">DESVÍO POSITIVO</p>
            <div className="glass-panel bg-white/5 p-4 flex items-center gap-4 border-none shadow-none group-hover:bg-white/10 transition-colors">
              <Building2 size={24} className="text-yellow-500" />
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entidad Colaboradora</p>
                <p className="text-sm font-bold">Alcaldía de Medellín</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
