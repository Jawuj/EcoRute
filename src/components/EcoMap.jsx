import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, MEDELLIN_COORDS } from '../constants';

const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#6b7280" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#1f2937" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export function EcoMap({ points = [], center = MEDELLIN_COORDS, zoom = 13, onMapClick, onMarkerClick, routeTarget = null, showHeatmap = false, userRole = 'ciudadano' }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [google, setGoogle] = useState(null);
  const markersRef = useRef([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(center);
  const userMarkerRef = useRef(null);

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    setOptions({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    const initMap = async () => {
      try {
        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');
        const { DirectionsRenderer } = await importLibrary('routes');
        const { HeatmapLayer } = await importLibrary('visualization');

        setGoogle({ AdvancedMarkerElement, HeatmapLayer });

        const mapInstance = new Map(mapRef.current, {
          center,
          zoom,
          styles: mapStyles,
          disableDefaultUI: true,
          mapId: 'ECO_RUTE_MAP_ID',
        });

        if (onMapClick) {
          mapInstance.addListener('click', (e) => {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          });
        }

        const renderer = new DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true, // No queremos los marcadores por defecto de la ruta A-B
          polylineOptions: { strokeColor: '#10b981', strokeWeight: 5 } // Ruta Verde
        });

        const heatmap = new HeatmapLayer({
          map: null,
          radius: 0.005, // Radio geográfico (aprox 500m)
          dissipating: false, // El punto no crece al alejar la cámara
          opacity: 0.7,
          maxIntensity: 5,
          gradient: [
            'rgba(0, 255, 0, 0)',        // Invisible base
            'rgba(0, 255, 0, 0.5)',      // Verde transparente
            'rgba(173, 255, 47, 0.6)',   // Verde amarillento
            'rgba(255, 255, 0, 0.8)',    // Amarillo
            'rgba(255, 165, 0, 0.9)',    // Naranja
            'rgba(255, 0, 0, 1)'         // Rojo intenso
          ]
        });

        setHeatmapLayer(heatmap);
        setDirectionsRenderer(renderer);
        setMap(mapInstance);

        // Empezar a rastrear la ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(
            (pos) => {
              setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => console.error("Error obteniendo ubicación:", err),
            { enableHighAccuracy: true, maximumAge: 10000 }
          );
        }
      } catch (e) {
        console.error("Google Maps Error:", e);
      }
    };

    initMap();
  }, []);

  const getSvgForMaterial = (material, estado) => {
    const color = estado === 'completado' ? '#10b981' : '#f59e0b';
    let path = '';

    switch (material) {
      case 'carton': // Box
        path = '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
        break;
      case 'vidrio': // Wine
        path = '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>';
        break;
      case 'plastico': // Trash2
        path = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>';
        break;
      case 'basura': // Trash
      default:
        path = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
        break;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); background: #111827; border-radius: 50%; padding: 4px; border: 2px solid ${color};">${path}</svg>`;
  };

  // 2. Actualizar Marcadores y Mapa de Calor
  useEffect(() => {
    if (!map || !google) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => {
      if (marker.map) marker.map = null;
    });
    markersRef.current = [];

    if (showHeatmap && heatmapLayer && window.google?.maps?.LatLng) {
      // Activar mapa de calor
      const heatData = points
        .filter(p => p.ubicacion && p.ubicacion.lat && p.ubicacion.lng)
        .map(p => new window.google.maps.LatLng(p.ubicacion.lat, p.ubicacion.lng));

      heatmapLayer.setData(heatData);
      heatmapLayer.setMap(map);
    } else {
      // Desactivar mapa de calor y mostrar marcadores
      if (heatmapLayer) heatmapLayer.setMap(null);

      // Agregar nuevos marcadores
      points.forEach((point) => {
        if (point.ubicacion) {
          const svgContainer = document.createElement('div');
          svgContainer.innerHTML = getSvgForMaterial(point.material, point.estado);
          svgContainer.style.cursor = 'pointer';

          // Hacer el marcador interactivo
          if (onMarkerClick) {
            svgContainer.addEventListener('click', (e) => {
              e.stopPropagation(); // Evitar que el clic pase al mapa de fondo
              onMarkerClick(point);
            });
          }

          const marker = new google.AdvancedMarkerElement({
            position: { lat: point.ubicacion.lat, lng: point.ubicacion.lng },
            map,
            title: point.material || 'Punto de Recogida',
            content: svgContainer,
          });
          markersRef.current.push(marker);
        }
      });
    }
  }, [points, map, google, onMarkerClick, showHeatmap, heatmapLayer]);

    // 3. Dibujar marcador del usuario y trazar ruta
    useEffect(() => {
      if (!map || !google || !currentLocation) return;

      if (userRole === 'admin') {
        if (userMarkerRef.current) {
          userMarkerRef.current.map = null;
          userMarkerRef.current = null;
        }
        return;
      }

      // Crear marcador del camión/usuario si no existe
      if (!userMarkerRef.current) {
        let iconColor = '#3b82f6'; // Ciudadano: Azul
        let iconPath = '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'; // User SVG
        
        if (userRole === 'reciclador') {
          iconColor = '#10b981'; // Reciclador: Verde
        } else if (userRole === 'trabajador') {
          iconColor = '#f97316'; // Trabajador: Naranja
          iconPath = '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'; // Truck SVG
        }

        const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); background: #111827; border-radius: 50%; padding: 6px; border: 3px solid ${iconColor};">${iconPath}</svg>`;
        const container = document.createElement('div');
        container.innerHTML = svgHtml;

        userMarkerRef.current = new google.AdvancedMarkerElement({
          position: currentLocation,
          map,
          title: 'Tu Ubicación',
          content: container,
        });
      } else {
        userMarkerRef.current.position = currentLocation;
      }

      // Calcular ruta si hay un objetivo
      if (routeTarget && directionsRenderer) {
        const calculateRoute = async () => {
          const { DirectionsService } = await importLibrary('routes');
          const directionsService = new DirectionsService();

          directionsService.route({
            origin: currentLocation,
            destination: routeTarget,
            travelMode: 'DRIVING',
          }, (response, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
            } else {
              console.error("Fallo al generar ruta:", status);
            }
          });
        };
        calculateRoute();
      } else if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] }); // Limpiar ruta si no hay target
      }

    }, [currentLocation, routeTarget, map, google, directionsRenderer, userRole]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[2rem]">
      <div ref={mapRef} className="w-full h-full" />
      {(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-center p-6">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            Configura GOOGLE_MAPS_API_KEY para activar el mapa
          </p>
        </div>
      )}
    </div>
  );
}
