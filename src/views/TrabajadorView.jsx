import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { EcoMap } from '../components/EcoMap';
import { MEDELLIN_COORDS } from '../constants';
import { calculateDistance, COMPLETION_THRESHOLD_METERS } from '../utils';
import { ImageModal } from '../components/ImageModal';

export function TrabajadorView({ user, showToast }) {
  const [pickups, setPickups] = useState([]);
  const [activePickup, setActivePickup] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isMapFull, setIsMapFull] = useState(false);
  const [modalImage, setModalImage] = useState(null);

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

  useEffect(() => {
    const fetchPickups = async () => {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .in('material', ['basura', 'escombros'])
        .order('created_at', { ascending: false });
      
      if (!error) setPickups(data);
    };

    fetchPickups();

    const channel = supabase
      .channel('trabajador-channel')
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
        updateData.reciclador_id = user.id; // Puede ser un trabajador o reciclador
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)] relative">
      {/* Lista de Tareas */}
      <div className={`lg:col-span-1 flex flex-col gap-4 overflow-hidden ${isMapFull ? 'hidden lg:flex' : ''}`}>
        <header className="flex justify-between items-end px-2">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Agenda</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Puntos de atención</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${showCompleted ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}
              >
                {showCompleted ? 'Ocultar completados' : 'Ver completados'}
              </button>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg border transition-all ${showHeatmap ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}
              >
                {showHeatmap ? 'Calor' : 'Calor'}
              </button>
            </div>
            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <span className="text-orange-500 text-[9px] font-black tracking-widest uppercase">
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
              onClick={() => { setActivePickup(pickup); setIsNavigating(true); }}
              className={`glass-panel p-4 cursor-pointer border-2 transition-all relative overflow-hidden group ${activePickup?.id === pickup.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
            >
              <div className="flex gap-4 relative z-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                  {pickup.imagen_url ? (
                    <img 
                      src={pickup.imagen_url} 
                      alt="Evidencia" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
                      onClick={(e) => { e.stopPropagation(); setModalImage(pickup.imagen_url); }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gradient-to-br from-white/5 to-transparent">
                      <ShieldCheck size={32} />
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
                    <h3 className="text-base font-black tracking-tight text-white leading-tight">Punto de Atención</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={8} /> Medellín, Antioquia
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {pickup.estado === 'pendiente' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(pickup, 'completado'); }}
                        className="btn-eco px-4 py-2 bg-orange-500 text-black rounded-xl hover:bg-orange-400 shadow-lg shadow-orange-500/10"
                      >
                        RESOLVER
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black rounded-lg text-green-500 flex items-center gap-1.5">
                        <CheckCircle size={8} /> RESUELTO
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActivePickup(pickup); }}
                      className="btn-eco btn-outline px-4 py-2"
                    >
                      VER MAPA
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-24 h-24 blur-[50px] opacity-10 rounded-full transition-colors ${activePickup?.id === pickup.id ? 'bg-orange-500' : 'bg-white/5'}`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mapa y Detalle */}
      <div className={`transition-all duration-500 relative ${isMapFull ? 'fixed inset-0 z-[5000] p-0' : 'lg:col-span-2 glass-panel border-white/5 overflow-hidden'}`}>
        <EcoMap 
          points={pickups} 
          center={activePickup?.ubicacion || userLocation || MEDELLIN_COORDS} 
          zoom={14} 
          userLocation={userLocation}
          showHeatmap={showHeatmap}
          routeTarget={isNavigating ? activePickup?.ubicacion : null}
          onRouteFound={(info) => setRouteInfo(info)}
          onMarkerClick={(pickup) => { setActivePickup(pickup); setIsNavigating(true); setRouteInfo(null); }}
        >
          {activePickup && (
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }}
              className="absolute bottom-4 left-4 right-4 glass-panel p-4 md:p-6 bg-black/60 backdrop-blur-xl border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 z-[9999]"
            >
              <div className="flex items-center gap-4 md:gap-6">
                {activePickup.imagen_url && (
                  <img 
                    src={activePickup.imagen_url} 
                    className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white/10 cursor-zoom-in hover:scale-105 transition-transform" 
                    alt="Evidencia" 
                    onClick={() => setModalImage(activePickup.imagen_url)}
                  />
                )}
                <div>
                  <p className="text-[8px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest text-center md:text-left">Atención Requerida</p>
                  <h3 className="text-base md:text-xl font-black uppercase text-center md:text-left">Material: {activePickup.material}</h3>
                  {isNavigating && routeInfo && (
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 text-center md:text-left">
                      {routeInfo.time} min ({routeInfo.distance} km)
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 font-medium italic text-center md:text-left">Estado: {activePickup.estado}</p>
                </div>
              </div>
              {activePickup.estado === 'pendiente' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => { setIsNavigating(false); setRouteInfo(null); }}
                    className="px-6 py-3 md:px-8 md:py-4 bg-red-500/10 text-red-500 text-xs md:text-sm font-black rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    CANCELAR RUTA
                  </button>
                  {(() => {
                    const dist = userLocation ? calculateDistance(userLocation, activePickup.ubicacion) : 1000;
                    const isNear = dist <= COMPLETION_THRESHOLD_METERS;
                    
                    return (
                      <button 
                        onClick={() => updateStatus(activePickup, 'completado')}
                        className={`px-6 py-3 md:px-8 md:py-4 font-black rounded-2xl shadow-xl transition-all ${isNear ? 'bg-orange-500 text-black shadow-orange-500/20 hover:scale-105' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                        disabled={!isNear}
                      >
                        {isNear ? 'RECOLECTAR' : `MUY LEJOS (${Math.round(dist)}m)`}
                      </button>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}
          <ImageModal 
            isOpen={!!modalImage} 
            imageUrl={modalImage} 
            onClose={() => setModalImage(null)} 
          />
        </EcoMap>
      </div>
    </div>
  );
}
