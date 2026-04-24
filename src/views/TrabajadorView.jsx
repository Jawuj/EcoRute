import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ListChecks, PenTool as Tool, AlertTriangle, UserCheck, CheckCircle, Clock } from 'lucide-react';

export function TrabajadorView() {
  const tasks = [
    { id: 1, title: 'Limpieza Punto Crítico #12', area: 'Prado Centro', time: '08:00 AM', status: 'pendiente' },
    { id: 2, title: 'Mantenimiento de Vehículo', area: 'Base Operativa', time: '11:30 AM', status: 'completado' },
    { id: 3, title: 'Inspección Sanitaria', area: 'Comuna 13', time: '02:00 PM', status: 'pendiente' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="space-y-1">
        <h2 className="text-4xl font-black tracking-tighter">Agenda Operativa</h2>
        <p className="text-gray-400 font-medium italic">Gestión de tareas de campo y mantenimiento.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 border-orange-500/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-2xl">
                  <Calendar className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight">Tareas Programadas</h3>
              </div>
              <div className="px-4 py-1 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">24 Mayo, 2024</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {tasks.map((task, idx) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[80px]">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{task.time}</p>
                      <div className="h-4 w-px bg-white/10 mx-auto my-1" />
                      <Clock size={16} className="text-gray-600 mx-auto" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl tracking-tighter uppercase group-hover:text-orange-400 transition-colors">{task.title}</h4>
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                        <Tool size={12} /> {task.area}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${task.status === 'completado' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                    {task.status === 'completado' ? <CheckCircle size={18} /> : <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{task.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <Tool className="text-orange-500" size={24} />
              Acciones de Campo
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-left">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-red-400">Emergencia</p>
                  <p className="font-bold text-sm">Reportar Incidente</p>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all text-left">
                <div className="p-3 bg-orange-500/20 rounded-2xl">
                  <UserCheck size={24} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-orange-400">Equipo</p>
                  <p className="font-bold text-sm">Solicitar Soporte</p>
                </div>
              </button>
            </div>
          </div>

          <div className="glass-panel p-8 bg-orange-600/10 border-orange-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ListChecks size={80} className="text-orange-500" />
            </div>
            <h3 className="font-black text-orange-400 uppercase tracking-widest text-[10px] mb-4">Aviso de Operaciones</h3>
            <p className="text-sm font-medium italic text-gray-300 leading-relaxed relative z-10">
              "Gran trabajo esta semana en la Comuna 10. Mantengamos el ritmo para la jornada de recolección masiva del sábado."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/40 flex items-center justify-center text-[10px] font-black text-white">DR</div>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">David R. - Supervisor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
