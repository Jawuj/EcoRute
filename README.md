# ♻️ EcoRuta Inteligente

> **Plataforma de Gestión y Optimización de Rutas de Reciclaje y Reporte de Puntos Críticos.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.104-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Descripción

**EcoRuta Inteligente** es una solución digital diseñada para optimizar la recolección de residuos sólidos y facilitar la interacción entre ciudadanos, recicladores, trabajadores y administradores. La plataforma permite a los usuarios reportar puntos críticos de acumulación de basura, solicitar recolecciones de material reciclable, y gestionar rutas de forma eficiente a través de mapas interactivos.

Esta herramienta busca transformar la gestión ambiental urbana, mejorando los tiempos de respuesta y fomentando una cultura de reciclaje y responsabilidad ciudadana mediante herramientas accesibles y en tiempo real.

---

## Características Principales

### Para Ciudadanos
- **Reporte de Puntos Críticos**: Notifica ubicaciones con acumulación de basura usando geolocalización.
- **Solicitud de Recolección**: Programa recogidas de material reciclable directamente en tu ubicación.
- **Seguimiento**: Monitorea el estado de tus solicitudes (Pendiente, En Progreso, Completado).

### Para Recicladores
- **Visualización de Solicitudes**: Accede a un mapa interactivo con las solicitudes de recolección de los ciudadanos.
- **Gestión de Rutas**: Acepta y actualiza el estado de las recogidas para optimizar el trabajo de recolección.

### Para Trabajadores
- **Gestión de Reportes**: Visualiza y atiende los reportes de puntos críticos generados por los ciudadanos.
- **Actualización de Estado**: Marca los puntos críticos como resueltos una vez se ha realizado la limpieza.

### Para Administradores (Panel Admin)
- **Dashboard Estadístico**: Visualización de métricas generales del sistema (usuarios, reportes, recolecciones).
- **Gestión Global**: Supervisión de toda la actividad de la plataforma y administración de recursos.
- **Analíticas en Tiempo Real**: Gráficos interactivos sobre el impacto ambiental y eficiencia de las rutas.

---

## Tecnologías

- **Frontend**: 
  - [React 19](https://reactjs.org/) (Hooks, Componentes Funcionales).
  - [Vite](https://vitejs.dev/) para un desarrollo ultrarrápido.
  - [Tailwind CSS 4](https://tailwindcss.com/) para estilos rápidos, responsivos y modernos.
  - [Framer Motion](https://www.framer.com/motion/) para animaciones fluidas.
  - [Lucide React](https://lucide.dev/) para iconografía.
- **Backend (Supabase)**:
  - **PostgreSQL**: Base de datos relacional poderosa y escalable.
  - **Autenticación**: Gestión de usuarios basada en roles (Ciudadano, Reciclador, Trabajador, Admin).
- **Integraciones**:
  - **Google Maps API**: Mapas interactivos, geolocalización y visualización de rutas/marcadores.

---

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Jawuj/EcoRute.git
cd EcoRute
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configuración de Entorno
Crea un proyecto en [Supabase](https://supabase.com/) y obtén tus credenciales. Asegúrate de configurar también tu API Key de **Google Maps**.

Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
```env
VITE_SUPABASE_URL="TU_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="TU_SUPABASE_ANON_KEY"
VITE_GOOGLE_MAPS_API_KEY="TU_GOOGLE_MAPS_API_KEY"
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

---

## Estructura del Proyecto

```text
EcoRute/
├── public/                 # Recursos estáticos (Favicon, Iconos)
├── src/
│   ├── components/         # Componentes reutilizables (EcoMap, Toast)
│   ├── views/              # Vistas principales separadas por rol (Admin, Ciudadano, Reciclador, Trabajador)
│   ├── supabase.js         # Configuración y cliente de Supabase
│   ├── utils.js            # Funciones de utilidad y helpers
│   ├── constants.js        # Constantes globales de la aplicación
│   ├── App.jsx             # Router, layout principal y gestión de estado de autenticación
│   ├── index.css           # Estilos globales y configuración de Tailwind
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env                    # Variables de entorno (No incluido en el repo)
└── package.json            # Dependencias y scripts
```

---

## Contribución

¡Las contribuciones son bienvenidas para hacer de nuestra ciudad un lugar más limpio!

1. Haz un **Fork** del proyecto.
2. Crea una **Rama** para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`).
3. Realiza un **Commit** de tus cambios (`git commit -m 'Añadir NuevaFuncionalidad'`).
4. Haz **Push** a la rama (`git push origin feature/NuevaFuncionalidad`).
5. Abre un **Pull Request**.

---

## Contacto

[Repositorio del Proyecto](https://github.com/Jawuj/EcoRute)

---

*EcoRuta Inteligente - Transformando el reciclaje urbano con tecnología.*
