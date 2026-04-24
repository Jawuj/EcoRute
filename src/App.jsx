import React, { useState } from 'react';
import { CiudadanoView } from './views/CiudadanoView';
import { RecicladorView } from './views/RecicladorView';
import { AdminView } from './views/AdminView';
import { TrabajadorView } from './views/TrabajadorView';
import { User, ShieldCheck, MapPin, BarChart3, Truck, LogOut, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase';
import { EcoMap } from './components/EcoMap';
import { ToastContainer } from './components/Toast.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: usuario, error: sbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nombre', name)
        .eq('rol', role)
        .single();

      if (sbError || !usuario) throw new Error("Usuario no encontrado.");
      setUser({ id: usuario.id, name: usuario.nombre, role: usuario.rol });
      showToast(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (role === 'admin') {
      setError('No se permite registrar nuevas cuentas de Administrador.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: sbError } = await supabase
        .from('usuarios')
        .insert([{ nombre: name, password, rol: role }])
        .select()
        .single();

      if (sbError) throw new Error("Error al registrar: " + sbError.message);
      setUser({ id: data.id, name: data.nombre, role: data.rol });
      showToast("¡Cuenta creada con éxito!");
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setUser({ id: null, name: 'Invitado', role: role || 'ciudadano' });
  };

  const roleConfigs = [
    { id: 'ciudadano', icon: User, label: 'Ciudadano', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
    { id: 'reciclador', icon: Truck, label: 'Reciclador', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
    { id: 'admin', icon: BarChart3, label: 'Admin', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-400/10', secure: true },
    { id: 'trabajador', icon: ShieldCheck, label: 'Trabajador', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10', secure: true },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
        {/* Mapa de fondo */}
        <div className="absolute inset-0 opacity-40 grayscale-[0.5]">
          <EcoMap />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-xl p-8 md:p-12 relative z-10 overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
          
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter">ECO RUTA</h1>
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setIsRegistering(false)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                Entrar
              </button>
              <button 
                onClick={() => setIsRegistering(true)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                Registrar
              </button>
            </div>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tu Identificación</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full py-3 text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full py-3.5"
                      style={{ paddingLeft: '3.5rem' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isRegistering || role === 'admin' || role === 'trabajador'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Selecciona tu Perfil</label>
                <div className="grid grid-cols-2 gap-3">
                  {roleConfigs
                    .filter(cfg => !isRegistering || !cfg.secure || cfg.id !== 'admin')
                    .map((cfg) => (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => { setRole(cfg.id); setError(''); }}
                      className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === cfg.id ? `${cfg.border} ${cfg.bg}` : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                    >
                      <cfg.icon className={`${role === cfg.id ? cfg.color : 'text-gray-600'}`} size={24} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${role === cfg.id ? 'text-white' : 'text-gray-500'}`}>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-4 rounded-2xl border border-red-400/20">
                {error}
              </motion.p>
            )}

            <div className="pt-4 space-y-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-eco btn-primary w-full py-4 text-sm"
              >
                {loading ? 'Procesando...' : (isRegistering ? 'Crear mi Cuenta' : 'Entrar a mi Cuenta')}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Ó acceso rápido</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setUser({ id: '11111111-1111-1111-1111-111111111111', name: 'Invitado', role: 'ciudadano' })}
                  className="p-4 rounded-2xl border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="p-2 bg-green-500 rounded-xl shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                    <User size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-none">CIUDADANO</p>
                    <p className="text-[8px] font-bold text-green-400/60 uppercase tracking-widest mt-1">Acceso Rápido</p>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setUser({ id: '22222222-2222-2222-2222-222222222222', name: 'Invitado', role: 'reciclador' })}
                  className="p-4 rounded-2xl border-2 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <Truck size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-none">RECICLADOR</p>
                    <p className="text-[8px] font-bold text-orange-400/60 uppercase tracking-widest mt-1">Acceso Rápido</p>
                  </div>
                </button>
              </div>
            </div>
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
            {user.role === 'ciudadano' && <CiudadanoView user={user} showToast={showToast} />}
            {user.role === 'reciclador' && <RecicladorView user={user} showToast={showToast} />}
            {user.role === 'admin' && <AdminView user={user} showToast={showToast} />}
            {user.role === 'trabajador' && <TrabajadorView user={user} showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
