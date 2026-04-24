import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { EcoMap } from '../components/EcoMap';
import { MEDELLIN_COORDS } from '../constants';

export function RecicladorView({ user }) {
  const [pickups, setPickups] = useState([]);
  const [activePickup, setActivePickup] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Obtener ubicación inicial del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error obteniendo ubicación:", err)
      );
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

  const updateStatus = async (id, newStatus) => {
    try {
      const updateData = { estado: newStatus };
      if (newStatus === 'completado') {
        updateData.reciclador_id = user.id;
      }

      const { error } = await supabase
        .from('reportes')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      if (newStatus === 'completado') {
        setActivePickup(null);
        setIsNavigating(false);
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
      {/* Lista de Reportes Pendientes */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-4">
        <header className="flex justify-between items-center sticky top-0 bg-black/40 backdrop-blur-md p-2 z-10">
          <h2 className="text-xl font-black uppercase tracking-tighter">Rutas Pendientes</h2>
          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20">
            {pickups.filter(p => p.estado === 'pendiente').length} TOTAL
          </span>
        </header>

        <div className="space-y-4">
          {pickups.map((pickup) => (
            <motion.div
              key={pickup.id}
              layout
              onClick={() => { setActivePickup(pickup); setIsNavigating(false); }}
              className={`glass-panel p-5 cursor-pointer border-2 transition-all group ${activePickup?.id === pickup.id ? 'border-green-500 bg-green-500/5' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="flex gap-4">
                {/* Miniatura de la imagen o Icono */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                  {pickup.imagen_url ? (
                    <img src={pickup.imagen_url} alt="Evidencia" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Truck size={32} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                      {pickup.material}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold">
                      {new Date(pickup.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold truncate">Reporte en Medellín</h3>
                  <div className="flex gap-2">
                    {pickup.estado === 'pendiente' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(pickup.id, 'completado'); }}
                        className="px-3 py-1 bg-green-500 text-black text-[9px] font-black rounded-lg hover:bg-green-400 transition-colors"
                      >
                        RECOGER
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-white/10 text-[9px] font-black rounded-lg text-gray-400">COMPLETADO</span>
                    )}
                    <button className="px-3 py-1 bg-white/5 text-[9px] font-black rounded-lg hover:bg-white/10">
                      VER MAPA
                    </button>
                  </div>
                </div>
              </div>
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
                  onClick={() => updateStatus(activePickup.id, 'completado')}
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
