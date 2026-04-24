import React, { useState } from 'react';
import { Camera, MapPin, Send, Trash2, Box, Wine, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function CiudadanoView() {
  const [material, setMaterial] = useState('');
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);

  const materials = [
    { id: 'carton', name: 'Cartón', icon: Box, color: 'from-orange-400 to-orange-600 shadow-orange-500/20' },
    { id: 'vidrio', name: 'Vidrio', icon: Wine, color: 'from-blue-300 to-blue-500 shadow-blue-400/20' },
    { id: 'plastico', name: 'Plástico', icon: Trash2, color: 'from-yellow-300 to-yellow-500 shadow-yellow-400/20' },
  ];

  const handleReport = async (e) => {
    e.preventDefault();
    if (!material) return;
    
    setLoading(true);
    try {
      // Guardar en Firebase
      await addDoc(collection(db, "reportes"), {
        material,
        ubicacion: { lat: 6.2442, lng: -75.5812 }, // Simulado
        timestamp: serverTimestamp(),
        estado: 'pendiente'
      });
      
      setReported(true);
      setTimeout(() => setReported(false), 4000);
    } catch (err) {
      console.error("Error al guardar reporte:", err);
      alert("Error al conectar con Firebase. Revisa tu configuración en firebase.js");
    } finally {
      setLoading(false);
      setMaterial('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight">Reportar Punto Crítico</h2>
        <p className="text-gray-400 font-medium">Contribuye a una Medellín más limpia y sostenible.</p>
      </header>

      <div className="glass-panel p-10">
        <form onSubmit={handleReport} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative p-10 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                <Camera size={36} className="text-gray-400 group-hover:text-blue-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">Subir Fotografía</span>
            </div>
            
            <div className="group relative p-10 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-green-500/30 hover:bg-green-500/5 transition-all cursor-pointer">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                <MapPin size={36} className="text-gray-400 group-hover:text-green-400" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white block">Ubicación GPS</span>
                <span className="text-[10px] text-blue-400 font-mono mt-1 opacity-60">6.2442, -75.5812</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-center">Tipo de Residuo</label>
            <div className="grid grid-cols-3 gap-4">
              {materials.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaterial(m.id)}
                  className={`p-6 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all ${material === m.id ? 'border-white bg-white/10 scale-105 shadow-xl' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                >
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${m.color} shadow-lg ${material === m.id ? 'scale-110' : 'grayscale opacity-50'}`}>
                    <m.icon size={28} className="text-white" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-tighter ${material === m.id ? 'text-white' : 'text-gray-600'}`}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {reported ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-green-500 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/40"
              >
                <CheckCircle size={24} className="text-white" />
                <span className="font-black uppercase tracking-widest text-white">¡Reporte Enviado con Éxito!</span>
              </motion.div>
            ) : (
              <button 
                type="submit" 
                disabled={!material || loading}
                className="btn-eco w-full bg-blue-600 hover:bg-blue-500 py-5 shadow-2xl shadow-blue-600/30 text-white"
              >
                {loading ? 'Sincronizando...' : 'Enviar Solicitud de Recogida'}
                {!loading && <Send size={20} />}
              </button>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="glass-panel p-8 bg-blue-600/10 border-blue-500/20 flex items-center gap-6">
        <div className="p-4 bg-blue-600 rounded-2xl">
          <Trash2 className="text-white" size={24} />
        </div>
        <div>
          <h3 className="font-black text-lg uppercase tracking-tight">Impacto Ambiental</h3>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">Cada reporte gestionado evita que hasta 2 kg de residuos lleguen al relleno sanitario **La Pradera**.</p>
        </div>
      </div>
    </div>
  );
}
