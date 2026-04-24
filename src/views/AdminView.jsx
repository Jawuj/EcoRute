import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Building2, Map as MapIcon, Users, ArrowUpRight } from 'lucide-react';
import { EcoMap } from '../components/EcoMap';
import { supabase } from '../supabase';

export function AdminView() {
  const [reports, setReports] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: repData, error: repErr } = await supabase.from('reportes').select('*');
      if (!repErr) setReports(repData);

      const { data: usersData, error: userErr } = await supabase.from('usuarios').select('*');
      if (!userErr) {
        setAllUsers(usersData);
        setUsersCount(usersData.filter(u => u.rol === 'ciudadano').length);
      }
    };

    fetchData();

    const channel = supabase
      .channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const completedReports = reports.filter(r => r.estado === 'completado' && r.reciclador_id);
  const rankingMap = {};
  completedReports.forEach(r => {
    rankingMap[r.reciclador_id] = (rankingMap[r.reciclador_id] || 0) + 1;
  });
  
  const ranking = Object.entries(rankingMap)
    .map(([id, count]) => {
      const u = allUsers.find(user => user.id === id);
      return { id, nombre: u ? u.nombre : 'Usuario Borrado', count, rol: u ? u.rol : '' };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = [
    { label: 'Ciudadanos Registrados', value: usersCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Reportes Históricos', value: reports.length.toString(), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Top Recolectores */}
      <div className="glass-panel p-8">
        <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3">
          <span className="text-yellow-500">🏆</span> Ranking Operativo (Reportes Completados)
        </h3>
        {ranking.length > 0 ? (
          <div className="space-y-3">
            {ranking.map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-white'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold">{user.nombre}</p>
                    <p className="text-[10px] font-black uppercase text-gray-500">{user.rol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-400">{user.count}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Completados</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-medium">Aún no hay reportes completados por el equipo.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <MapIcon className="text-yellow-500" size={24} />
              Monitor Geoespacial: Medellín
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${showHeatmap ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
              >
                {showHeatmap ? 'Ocultar Calor' : 'Ver Mapa de Calor'}
              </button>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-lg border border-red-500/30">{reports.filter(r => r.estado === 'pendiente').length} Pendientes</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-lg border border-green-500/30">{reports.filter(r => r.estado === 'completado').length} Atendidos</span>
            </div>
          </div>
          
          <div className="aspect-video bg-black/40 border border-white/5 rounded-[2rem] relative overflow-hidden">
            <EcoMap points={reports} showHeatmap={showHeatmap} />
          </div>
        </div>

        <div className="glass-panel p-10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Gestionar Equipo</h3>
            <p className="text-xs text-gray-500 font-bold">Crea nuevas cuentas para trabajadores de campo.</p>
          </div>

          <WorkerForm />
        </div>
      </div>
    </div>
  );
}

function WorkerForm() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{ nombre, password, rol: 'trabajador' }]);

      if (error) throw error;
      setSuccess(true);
      setNombre('');
      setPassword('');
    } catch (err) {
      alert("Error al crear trabajador: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateWorker} className="space-y-4">
      <input 
        type="text" 
        placeholder="Nombre del trabajador" 
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full bg-white/5 border-white/10 text-sm"
        required
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-white/5 border-white/10 text-sm"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full btn-eco bg-yellow-500 text-black font-black py-3 hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Registrar Trabajador'}
      </button>
      {success && (
        <p className="text-green-400 text-[10px] font-black uppercase text-center mt-2 animate-bounce">
          ¡Trabajador registrado con éxito!
        </p>
      )}
    </form>
  );
}
