import React, { useState } from 'react';
import { CiudadanoView } from './views/CiudadanoView';
import { RecicladorView } from './views/RecicladorView';
import { AdminView } from './views/AdminView';
import { TrabajadorView } from './views/TrabajadorView';
import { User, ShieldCheck, MapPin, BarChart3, Truck, LogOut, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Lógica de contraseña para roles específicos
    if (role === 'admin' || role === 'trabajador') {
      if (password !== 'eco2024') { // Contraseña de demostración
        setError('Contraseña incorrecta para este perfil.');
        return;
      }
    }

    if (name && role) {
      setUser({ name, role });
    }
  };

  const roleConfigs = [
    { id: 'ciudadano', icon: User, label: 'Ciudadano', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
    { id: 'reciclador', icon: Truck, label: 'Reciclador', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
    { id: 'admin', icon: BarChart3, label: 'Admin', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', secure: true },
    { id: 'trabajador', icon: ShieldCheck, label: 'Trabajador', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10', secure: true },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black selection:bg-green-500/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-lg p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
          
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-xl shadow-green-500/30">
              <MapPin size={48} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-black text-center mb-2 tracking-tighter">ECO RUTA</h1>
          <p className="text-gray-400 text-center mb-10 font-medium">Gestión Circular Medellín</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Identificación</label>
              <input
                type="text"
                placeholder="Ingresa tu nombre completo"
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Selecciona tu Rol</label>
              <div className="grid grid-cols-2 gap-4">
                {roleConfigs.map((cfg) => (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => { setRole(cfg.id); setError(''); }}
                    className={`group p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === cfg.id ? `${cfg.border} ${cfg.bg}` : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                  >
                    <cfg.icon className={`${role === cfg.id ? cfg.color : 'text-gray-600'} transition-colors group-hover:scale-110 duration-300`} size={28} />
                    <span className={`text-[11px] font-extrabold uppercase tracking-widest ${role === cfg.id ? 'text-white' : 'text-gray-500'}`}>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {(role === 'admin' || role === 'trabajador') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Contraseña de Seguridad</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">
                {error}
              </motion.p>
            )}

            <button type="submit" className="btn-eco w-full bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5 mt-4">
              Iniciar Sesión
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const activeRole = roleConfigs.find(r => r.id === user.role);

  return (
    <div className={`min-h-screen role-bg-transition role-${user.role}`}>
      <nav className="p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto glass-panel px-8 py-5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${activeRole.bg} border-2 ${activeRole.border}`}>
              <activeRole.icon className={activeRole.color} size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter leading-none">ECO RUTA</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] uppercase font-bold text-gray-500">Sesión iniciada</p>
              <p className="text-sm font-bold tracking-tight">{user.name}</p>
            </div>
            <button 
              onClick={() => { setUser(null); setRole(null); setPassword(''); }}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all group"
            >
              <LogOut size={22} className="group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </nav>

      <main className="px-6 pb-20 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {user.role === 'ciudadano' && <CiudadanoView />}
            {user.role === 'reciclador' && <RecicladorView />}
            {user.role === 'admin' && <AdminView />}
            {user.role === 'trabajador' && <TrabajadorView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
