import React, { useState } from 'react';
import { Camera, MapPin, Send, Trash2, Box, Wine, CheckCircle, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { EcoMap } from '../components/EcoMap';

export function CiudadanoView({ user }) {
  const [material, setMaterial] = useState('');
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 6.2442, lng: -75.5812 });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Geolocalización denegada/error:", err)
      );
    }
  }, []);

  const materials = [
    { id: 'carton', name: 'Cartón', icon: Box, color: 'from-orange-400 to-orange-600 shadow-orange-500/20' },
    { id: 'vidrio', name: 'Vidrio', icon: Wine, color: 'from-blue-300 to-blue-500 shadow-blue-400/20' },
    { id: 'plastico', name: 'Plástico', icon: Trash2, color: 'from-yellow-300 to-yellow-500 shadow-yellow-400/20' },
    { id: 'basura', name: 'Basura', icon: Trash, color: 'from-gray-500 to-gray-700 shadow-gray-500/20' },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!material) return;
    
    setLoading(true);
    let publicUrl = null;

    try {
      // 1. Subir imagen si existe
      if (imageFile) {
        setUploading(true);
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fotos_reportes')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage
          .from('fotos_reportes')
          .getPublicUrl(fileName);
        
        publicUrl = url;
      }

      // 2. Guardar reporte en base de datos
      const { error } = await supabase
        .from('reportes')
        .insert([
          { 
            material, 
            ubicacion: location,
            estado: 'pendiente',
            usuario_id: user.id,
            imagen_url: publicUrl 
          }
        ]);

      if (error) throw error;
      
      setReported(true);
      setImageFile(null);
      setTimeout(() => setReported(false), 4000);
    } catch (err) {
      console.error("Error completo:", err);
      alert("Error: " + (err.message || "No se pudo conectar con Supabase. Verifica el SQL y el Bucket."));
    } finally {
      setLoading(false);
      setUploading(false);
      setMaterial('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight">Reportar Punto Crítico</h2>
        <p className="text-gray-400 font-medium">Contribuye a una Medellín más limpia y sostenible.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 space-y-8">
          <form onSubmit={handleReport} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500">1. Tipo de Residuo</label>
              <div className="grid grid-cols-3 gap-4">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMaterial(m.id)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all ${material === m.id ? 'border-white bg-white/10 scale-105 shadow-xl' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                  >
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${m.color} shadow-lg ${material === m.id ? 'scale-110' : 'grayscale opacity-50'}`}>
                      <m.icon size={24} className="text-white" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${material === m.id ? 'text-white' : 'text-gray-600'}`}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500">2. Evidencia (Obligatoria)</label>
              <label className="group relative p-6 border-2 border-dashed border-white/5 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                  <Camera size={24} className={imageFile ? "text-green-400" : "text-gray-400 group-hover:text-blue-400"} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white block">
                    {imageFile ? "Imagen Seleccionada" : "Subir Fotografía"}
                  </span>
                  {imageFile && (
                    <span className="text-[10px] text-green-400 font-mono truncate block max-w-[200px]">
                      {imageFile.name}
                    </span>
                  )}
                </div>
              </label>
            </div>

            <AnimatePresence mode="wait">
              {reported ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/40"
                >
                  <CheckCircle size={20} className="text-white" />
                  <span className="font-black text-sm uppercase tracking-widest text-white">¡Enviado!</span>
                </motion.div>
              ) : (
                <button 
                  type="submit" 
                  disabled={!material || !imageFile || loading || uploading}
                  className="btn-eco w-full bg-blue-600 hover:bg-blue-500 py-4 shadow-2xl shadow-blue-600/30 text-white disabled:opacity-50"
                >
                  {uploading ? 'Subiendo imagen...' : (loading ? 'Enviando reporte...' : 'Confirmar Reporte')}
                  {!loading && !uploading && <Send size={18} />}
                </button>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="glass-panel p-0 overflow-hidden relative border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Punto de Recogida</h3>
              <p className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-2">
                <MapPin size={12} className="text-green-500" /> Medellín, Colombia
              </p>
            </div>
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">GPS Activo</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <EcoMap 
              points={[{ ubicacion: location }]} 
              center={location} 
              zoom={15} 
              onMapClick={(loc) => {
                // Restringir área a Medellín (Aprox: Lat 6.1 a 6.4, Lng -75.7 a -75.4)
                if (loc.lat >= 6.1 && loc.lat <= 6.4 && loc.lng >= -75.7 && loc.lng <= -75.4) {
                  setLocation(loc);
                } else {
                  alert("Eco Rute solo está disponible dentro del área metropolitana de Medellín. Selecciona un punto más cercano.");
                }
              }} 
            />
          </div>
          <div className="p-4 bg-black/40 backdrop-blur-md">
            <p className="text-[10px] text-gray-500 italic text-center font-bold">Haz clic en el mapa para ajustar la ubicación exacta</p>
          </div>
        </div>
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

