import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Building2, Map as MapIcon, Users, ArrowUpRight } from 'lucide-react';
import { EcoMap } from '../components/EcoMap';
import { supabase } from '../supabase';

export function AdminView({ user, showToast }) {
  const [reports, setReports] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [viewMode, setViewMode] = useState('stats'); // 'stats' | 'users' | 'reports'

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

  const handleDeleteUsers = async () => {
    if (!confirm(`¿Estás seguro de borrar ${selectedUsers.length} usuarios?`)) return;
    try {
      const { error } = await supabase.from('usuarios').delete().in('id', selectedUsers);
      if (error) throw error;
      setAllUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      showToast("Usuarios borrados con éxito");
    } catch (err) {
      showToast("Error al borrar usuarios: " + err.message, 'error');
    }
  };

  const handleDeleteReports = async () => {
    if (!confirm(`¿Estás seguro de borrar ${selectedReports.length} reportes?`)) return;
    try {
      const { error } = await supabase.from('reportes').delete().in('id', selectedReports);
      if (error) throw error;
      setReports(prev => prev.filter(r => !selectedReports.includes(r.id)));
      setSelectedReports([]);
      showToast("Reportes borrados con éxito");
    } catch (err) {
      showToast("Error al borrar reportes: " + err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Panel Estratégico</h2>
          <p className="text-gray-400 font-medium">Métricas de impacto y monitoreo en tiempo real.</p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          {[
            { id: 'stats', label: 'Dashboard', icon: TrendingUp },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'reports', label: 'Reportes', icon: MapIcon }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === tab.id ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {viewMode === 'stats' && (
        <>
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
                <EcoMap points={reports} showHeatmap={showHeatmap} userRole="admin" />
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
        </>
      )}

      {viewMode === 'users' && (
        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase tracking-tight">Gestión de Usuarios</h3>
            {selectedUsers.length > 0 && (
              <button 
                onClick={handleDeleteUsers}
                className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Borrar Seleccionados ({selectedUsers.length})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedUsers(e.target.checked ? allUsers.map(u => u.id) : [])} /></th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nombre</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Rol</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={(e) => setSelectedUsers(prev => e.target.checked ? [...prev, user.id] : prev.filter(id => id !== user.id))} /></td>
                    <td className="p-4 font-bold">{user.nombre}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${user.rol === 'admin' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{user.rol}</span></td>
                    <td className="p-4 text-[10px] text-gray-600 font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'reports' && (
        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase tracking-tight">Gestión de Reportes</h3>
            {selectedReports.length > 0 && (
              <button 
                onClick={handleDeleteReports}
                className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Borrar Seleccionados ({selectedReports.length})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedReports(e.target.checked ? reports.map(r => r.id) : [])} /></th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Material</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Fecha</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Imagen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map(report => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selectedReports.includes(report.id)} onChange={(e) => setSelectedReports(prev => e.target.checked ? [...prev, report.id] : prev.filter(id => id !== report.id))} /></td>
                    <td className="p-4 font-bold uppercase">{report.material}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${report.estado === 'pendiente' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>{report.estado}</span></td>
                    <td className="p-4 text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</td>
                    <td className="p-4">
                      {report.imagen_url && <img src={report.imagen_url} className="w-10 h-10 rounded-lg object-cover" alt="Reporte" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
      showToast("¡Trabajador registrado con éxito!");
    } catch (err) {
      showToast("Error al crear trabajador: " + err.message, 'error');
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
