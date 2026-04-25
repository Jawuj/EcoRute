import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.heat';
import { MEDELLIN_COORDS } from '../constants';

// Corregir íconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Componente para el mapa de calor
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatData = points
      .filter(p => p.ubicacion && p.ubicacion.lat && p.ubicacion.lng)
      .map(p => [
        p.ubicacion.lat, 
        p.ubicacion.lng, 
        p.material === 'escombros' ? 1.0 : 0.5 // Máxima intensidad para escombros
      ]); 

    const heatLayer = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: { 
        0.2: '#10b981', // Verde (Baja)
        0.6: '#f59e0b', // Naranja (Media)
        1.0: '#ef4444'  // Rojo (Alta)
      }
    }).addTo(map);

    return () => map.removeLayer(heatLayer);
  }, [map, points]);

  return null;
}

// Componente para la ruta (Routing Machine)
function Routing({ origin, destination, userRole, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const routeColor = userRole === 'trabajador' ? '#f97316' : '#10b981';

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      lineOptions: {
        styles: [{ color: routeColor, weight: 6, opacity: 0.8 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      if (onRouteFound) {
        onRouteFound({
          time: Math.round(summary.totalTime / 60), // en minutos
          distance: (summary.totalDistance / 1000).toFixed(1) // en km
        });
      }
    });

    // Auto-centrar
    map.panTo([origin.lat, origin.lng]);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, origin, destination]);

  return null;
}

// Función para generar íconos personalizados con SVG
const createCustomIcon = (material, estado, isUser = false, userRole = '') => {
  let color = '#f59e0b'; // Default Orange
  let iconPath = '';
  let size = 32;

  // Color basado en tipo de material si no es el usuario
  if (!isUser) {
    switch (material) {
      case 'carton': color = '#f97316'; break; // Naranja
      case 'vidrio': color = '#3b82f6'; break; // Azul
      case 'plastico': color = '#eab308'; break; // Amarillo
      case 'basura': color = '#6b7280'; break; // Gris
      case 'escombros': color = '#ef4444'; break; // Rojo
      default: color = '#10b981'; // Verde por defecto
    }
  }

  if (isUser) {
    color = userRole === 'reciclador' ? '#10b981' : userRole === 'trabajador' ? '#f97316' : '#3b82f6';
    // Flecha tipo Navegador (Google Maps)
    iconPath = '<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>';
    size = 44;
  } else {
    switch (material) {
      case 'carton':
        iconPath = '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
        break;
      case 'vidrio':
        iconPath = '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>';
        break;
      case 'plastico':
        iconPath = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>';
        break;
      case 'escombros':
        iconPath = '<path d="M12 2v8"/><path d="m4.93 4.93 5.66 5.66"/><path d="M2 12h8"/><path d="m4.93 19.07 5.66-5.66"/><path d="M12 22v-8"/><path d="m19.07 19.07-5.66-5.66"/><path d="M22 12h-8"/><path d="m19.07 4.93-5.66 5.66"/>';
        break;
      default:
        iconPath = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
        break;
    }
  }

  const svg = `<div style="display: flex; flex-direction: column; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${isUser ? color : 'none'}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); ${isUser ? '' : `background: #111827; border-radius: 50%; padding: 6px; border: 3px solid ${color};`}">${iconPath}</svg>
    ${!isUser ? `<span style="background: ${color}; color: black; font-size: 8px; font-weight: 900; padding: 1px 4px; border-radius: 4px; margin-top: 2px; text-transform: uppercase;">${material}</span>` : ''}
  </div>`;
  
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-icon',
    iconSize: [size, size + 15],
    iconAnchor: [size/2, size/2 + 7],
  });
};

// Componente para auto-centrar el mapa en el usuario
function AutoFollow({ userLocation, active }) {
  const map = useMap();
  useEffect(() => {
    if (active && userLocation) {
      map.panTo([userLocation.lat, userLocation.lng], { animate: true });
    }
  }, [map, userLocation, active]);
  return null;
}

// Componente para re-centrar el mapa cuando cambian las coordenadas base
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng]);
    }
  }, [center, map]);
  return null;
}

// Componente para invalidar el tamaño al cambiar a pantalla completa
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, [map]);
  return null;
}

export function EcoMap({ children, points = [], center = MEDELLIN_COORDS, zoom = 13, onMapClick, onMarkerClick, onRouteFound, routeTarget = null, showHeatmap = false, userRole = 'ciudadano', userLocation = null }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden bg-[#111827] ${isFullscreen ? '' : 'rounded-[2rem]'}`}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <Recenter center={center} />
        <ResizeMap />
        <MapClickHandler onClick={onMapClick} />
        
        {/* Auto-seguir al usuario en navegación */}
        <AutoFollow userLocation={userLocation} active={!!routeTarget} />

        {/* Mapa de Calor */}
        {showHeatmap && <HeatmapLayer points={points} />}

        {/* Marcadores de puntos críticos */}
        {!showHeatmap && points.map((point, idx) => (
          point.ubicacion && (
            <Marker 
              key={idx} 
              position={[point.ubicacion.lat, point.ubicacion.lng]}
              icon={createCustomIcon(point.material, point.estado)}
              zIndexOffset={1000}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  if (onMarkerClick) onMarkerClick(point);
                },
              }}
            />
          )
        ))}

        {/* Marcador del Usuario */}
        {userLocation && userRole !== 'admin' && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={createCustomIcon(null, null, true, userRole)}
          />
        )}

        {/* Ruta en tiempo real (Modo Uber) */}
        {routeTarget && userLocation && (
          <Routing 
            origin={userLocation} 
            destination={routeTarget} 
            userRole={userRole} 
            onRouteFound={onRouteFound}
          />
        )}
      </MapContainer>

      {/* Renderizar contenido adicional (paneles de info) dentro del contenedor fullscreen */}
      {children}

      {/* Botón de Pantalla Completa (Real API) */}
      <button 
        onClick={toggleFullscreen}
        className="absolute top-24 right-4 p-4 bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all z-[9999] group"
        title="Pantalla Completa"
      >
        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isFullscreen ? 'Salir Fullscreen' : 'Pantalla Completa'}
        </span>
      </button>
    </div>
  );
}
