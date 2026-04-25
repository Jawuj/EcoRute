import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { EcoMap } from '../components/EcoMap';
import { MEDELLIN_COORDS } from '../constants';
import { calculateDistance, COMPLETION_THRESHOLD_METERS } from '../utils';

export function RecicladorView({ user, showToast }) {
  const [pickups, setPickups] = useState([]);
  const [activePickup, setActivePickup] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false); // Nuevo filtro

  // Rastrear ubicación del usuario en tiempo real
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error rastreando ubicación:", err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Escuchar reportes en tiempo real desde Supabase
  useEffect(() => {
    const fetchPickups = async () => {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .in('material', ['carton', 'vidrio', 'plastico'])
        .order('created_at', { ascending: false });
      
      if (!error) setPickups(data);
    };

    fetchPickups();

    const channel = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => fetchPickups())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (pickup, newStatus) => {
    if (newStatus === 'completado') {
      const dist = calculateDistance(userLocation, pickup.ubicacion);
      if (dist > COMPLETION_THRESHOLD_METERS) {
        showToast(`Estás muy lejos (${Math.round(dist)}m). Debes estar a menos de ${COMPLETION_THRESHOLD_METERS}m.`, 'error');
        return;
      }
    }

    try {
      const updateData = { estado: newStatus };
      if (newStatus === 'completado') {
        updateData.reciclador_id = user.id;
      }

      const { error } = await supabase
        .from('reportes')
        .update(updateData)
        .eq('id', pickup.id);
      
      if (error) throw error;
      if (newStatus === 'completado') {
        setActivePickup(null);
        setIsNavigating(false);
        showToast("¡Completado! El reporte se eliminará en 3 minutos.");
        setTimeout(async () => {
          await supabase.from('reportes').delete().eq('id', pickup.id);
        }, 180000);
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const filteredPickups = pickups.filter(p => showCompleted || p.estado === 'pendiente');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      {/* Lista de Reportes Pendientes */}
      <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
        <header className="flex justify-between items-end px-2">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Rutas</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Gestión de puntos</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${showCompleted ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}
            >
              {showCompleted ? 'Ocultar completados' : 'Ver completados'}
            </button>
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-xl">
              <span className="text-green-500 text-[9px] font-black tracking-widest uppercase">
                {pickups.filter(p => p.estado === 'pendiente').length} PENDIENTES
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredPickups.map((pickup) => (
            <motion.div
              key={pickup.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setActivePickup(pickup); setIsNavigating(false); }}
              className={`glass-panel p-4 cursor-pointer border-2 transition-all relative overflow-hidden group ${activePickup?.id === pickup.id ? 'border-green-500 bg-green-500/10' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
            >
              <div className="flex gap-4 relative z-10">
                {/* Miniatura de la imagen o Icono */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                  {pickup.imagen_url ? (
                    <img src={pickup.imagen_url} alt="Evidencia" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gradient-to-br from-white/5 to-transparent">
                      <Truck size={32} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${pickup.estado === 'pendiente' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">
                          {pickup.material}
                        </span>
                      </div>
                      <span className="text-[8px] text-gray-600 font-black tracking-widest">
                        {new Date(pickup.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-base font-black tracking-tight text-white leading-tight">Reporte en Medellín</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={8} /> Comuna 10 (Candelaria)
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {pickup.estado === 'pendiente' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(pickup, 'completado'); }}
                        className="btn-eco px-4 py-2 bg-green-500 text-black rounded-xl hover:bg-green-400 shadow-lg shadow-green-500/10"
                      >
                        RECOGER
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black rounded-lg text-green-500 flex items-center gap-1.5">
                        <CheckCircle size={8} /> COMPLETADO
                      </div>
                    )}
                    <button className="btn-eco btn-outline px-4 py-2">
                      VER MAPA
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-24 h-24 blur-[50px] opacity-10 rounded-full transition-colors ${activePickup?.id === pickup.id ? 'bg-green-500' : 'bg-white/5'}`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mapa y Detalle */}
      <div className="lg:col-span-2 glass-panel p-0 overflow-hidden relative border-white/5">
        <EcoMap 
          points={pickups} 
          center={activePickup?.ubicacion || userLocation || MEDELLIN_COORDS} 
          zoom={14} 
          routeTarget={isNavigating ? activePickup?.ubicacion : null}
          onMarkerClick={(pickup) => { setActivePickup(pickup); setIsNavigating(false); }}
        />
        
        {activePickup && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }}
            className="absolute bottom-6 left-6 right-6 glass-panel p-6 bg-black/60 backdrop-blur-xl border-green-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              {activePickup.imagen_url && (
                <img src={activePickup.imagen_url} className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10" alt="Evidencia" />
              )}
              <div>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Punto Seleccionado</p>
                <h3 className="text-xl font-black">Material: {activePickup.material}</h3>
                <p className="text-sm text-gray-400 font-medium">Estado: {activePickup.estado}</p>
              </div>
            </div>
            {activePickup.estado === 'pendiente' && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsNavigating(!isNavigating)}
                  className={`px-8 py-4 font-black rounded-2xl shadow-xl transition-all ${isNavigating ? 'bg-red-500/20 text-red-500 border-2 border-red-500/50 hover:bg-red-500/30' : 'bg-blue-600 text-white shadow-blue-600/20 hover:scale-105'}`}
                >
                  {isNavigating ? 'CANCELAR RUTA' : 'IR AL PUNTO'}
                </button>
                <button 
                  onClick={() => updateStatus(activePickup, 'completado')}
                  className="px-8 py-4 bg-green-500 text-black font-black rounded-2xl shadow-xl shadow-green-500/20 hover:scale-105 transition-all"
                >
                  MARCAR RECOGIDA
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
