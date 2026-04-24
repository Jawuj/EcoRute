import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, MEDELLIN_COORDS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, CheckCircle2, Clock, Map as MapIcon, ChevronRight, MapPin } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export function RecicladorView() {
  const mapRef = useRef(null);
  const [google, setGoogle] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [activePickup, setActivePickup] = useState(null);

  // Escuchar reportes en tiempo real desde Firebase
  useEffect(() => {
    const q = query(collection(db, "reportes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setPickups(docs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (pickups.length === 0) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    loader.load().then((googleInstance) => {
      setGoogle(googleInstance);
      const map = new googleInstance.maps.Map(mapRef.current, {
        center: MEDELLIN_COORDS,
        zoom: 13,
        styles: mapStyles,
        disableDefaultUI: true,
      });

      pickups.forEach((pickup) => {
        if (pickup.ubicacion) {
          const marker = new googleInstance.maps.Marker({
            position: { lat: pickup.ubicacion.lat, lng: pickup.ubicacion.lng },
            map,
            title: pickup.material,
            icon: {
              path: googleInstance.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: pickup.estado === 'completado' ? '#10b981' : '#f59e0b',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            }
          });
        }
      });
    }).catch(e => console.error("Map error:", e));
  }, [pickups]);

  const updateStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, "reportes", id);
      await updateDoc(docRef, { estado: newStatus });
      if (newStatus === 'completado') setActivePickup(null);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
      <div className="lg:col-span-2 flex flex-col gap-6 h-full">
        <div className="flex-1 glass-panel p-0 overflow-hidden relative border-white/5">
          <div ref={mapRef} id="map" className="w-full h-full" />
          
          <div className="absolute top-6 left-6 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex gap-1">
            <button className="px-4 py-2 bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-green-500/20">Mapa de Rutas</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors">Histórico</button>
          </div>

          <div className="absolute bottom-10 left-10 right-10">
            <div className="glass-panel p-6 bg-black/60 backdrop-blur-2xl flex items-center justify-between border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-2xl ring-2 ring-green-500/40">
                  <Navigation className="text-green-500" size={24} />
                </div>
                <div>
                  <h4 className="font-black tracking-tight text-lg">Siguiente Punto Crítico</h4>
                  <p className="text-xs font-bold text-gray-400">Comuna 10 - La Candelaria • A 0.8 km</p>
                </div>
              </div>
              <button className="btn-eco bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-600/30">
                Optimizar Trayecto
              </button>
            </div>
          </div>

          {GOOGLE_MAPS_API_KEY.includes('YOUR_API_KEY') && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-12 text-center">
              <div className="space-y-6 max-w-sm">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 inline-block">
                  <MapPin size={48} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Servicio Geográfico Desactivado</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Por favor, configura tu **API Key** en `constants.js` para habilitar el motor de navegación espacial.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8 h-full overflow-y-auto pr-2 custom-scrollbar">
        <header className="flex justify-between items-center">
          <h3 className="text-2xl font-black tracking-tight">Pendientes</h3>
          <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-gray-400">{pickups.length} TOTAL</span>
        </header>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pickups.map((pickup) => (
              <motion.div 
                key={pickup.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-panel p-6 border-2 transition-all group ${activePickup === pickup.id ? 'border-green-500 bg-green-500/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-2 py-1 bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400 rounded-md mb-2 inline-block border border-white/5">{pickup.material}</span>
                    <h4 className="font-black text-xl tracking-tighter uppercase">{pickup.id.slice(0, 8)}</h4>
                    <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} /> Hace poco en Comuna 10
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${pickup.estado === 'completado' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {pickup.estado === 'completado' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                </div>

                <div className="flex gap-2">
                  {pickup.estado === 'pendiente' && (
                    <button 
                      onClick={() => { setActivePickup(pickup.id); updateStatus(pickup.id, 'camino'); }}
                      className="btn-eco bg-white text-black hover:bg-gray-200 text-xs py-3 flex-1"
                    >
                      Tomar Ruta <ChevronRight size={16} />
                    </button>
                  )}
                  {pickup.estado === 'camino' && (
                    <button 
                      onClick={() => updateStatus(pickup.id, 'completado')}
                      className="btn-eco bg-green-600 text-white hover:bg-green-500 text-xs py-3 flex-1 shadow-lg shadow-green-600/20"
                    >
                      Finalizar Recogida
                    </button>
                  )}
                  {pickup.estado === 'completado' && (
                    <div className="w-full py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Recogida Exitosa</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {pickups.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-sm font-bold text-gray-600 italic uppercase tracking-widest">No hay reportes activos ahora</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#6b7280" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#1f2937" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];
