# GeoTracker - Rastreador de Ubicación y Conexión

![Version](https://img.shields.io/badge/version-3.1.6-blue.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Descripción

**GeoTracker** es una Progressive Web App (PWA) diseñada para Android que permite rastrear y registrar automáticamente la ubicación GPS y la calidad de conexión de red. La aplicación recolecta datos cada 15 segundos y los almacena localmente en formato CSV para su posterior análisis.

### Características Principales

-  **Rastreo GPS en tiempo real** con alta precisión
-  **Monitoreo de conexión de red** (tipo, velocidad, latencia)
-  **Almacenamiento local** - Los datos permanecen en el dispositivo
-  **Exportación a CSV** para análisis posterior
-  **Privacidad total** - No se envían datos a servidores externos
-  **Instalable como app nativa** en Android
-  **Funciona offline** gracias a Service Workers
-  **Interfaz moderna y responsive**

---

### Análisis de Cobertura en Zonas Geográficas

**GeoTracker** es ideal para crear **mapas de calor de cobertura de señal** en áreas específicas. Al recolectar datos de ubicación GPS junto con información de calidad de red, puedes:

#### Aplicaciones Prácticas

- **Análisis de cobertura móvil** - Identificar zonas con mejor/peor señal
- **Planificación de infraestructura** - Detectar áreas que requieren mejoras
- **Estudios de campo** - Relevar la calidad de servicio en diferentes ubicaciones
- **Comparación de operadores** - Evaluar cobertura entre diferentes proveedores
- **Optimización de rutas** - Planificar trayectos con mejor conectividad

#### Caso de Uso Cómo Generar un Mapa de Calor de Señal. 

1. **Recolección de Datos**
   - Recorrer la zona de interés con la app activa
   - La app registra automáticamente GPS + calidad de señal cada 15 segundos
   - Cubrir diferentes puntos del área a analizar

2. **Exportación de Datos**
   - Descargar el archivo CSV con todos los registros
   - El CSV contiene: coordenadas GPS, tipo de conexión, velocidad, latencia

3. **Visualización**
   - Importar el CSV en herramientas de mapeo:
     - **Google My Maps** - Crear mapas personalizados
     - **QGIS** - Software GIS profesional (gratuito)
     - **Kepler.gl** - Visualización de datos geoespaciales
     - **Python + Folium** - Generar mapas interactivos
     - **Excel/Google Sheets** - Análisis básico con gráficos

4. **Análisis**
   - Identificar patrones de cobertura
   - Detectar zonas críticas (baja señal)
   - Generar reportes visuales con mapas de calor

#### Ejemplo de Análisis

```python
# Ejemplo simple con Python y Folium
import pandas as pd
import folium
from folium.plugins import HeatMap

# Cargar datos
df = pd.read_csv('geotracker_2026-02-13.csv')

# Crear mapa base
mapa = folium.Map(location=[df['latitude'].mean(), df['longitude'].mean()], zoom_start=13)

# Preparar datos para mapa de calor (lat, lon, intensidad)
# Usar velocidad de descarga como métrica de calidad
heat_data = [[row['latitude'], row['longitude'], row['downlink']] 
             for index, row in df.iterrows()]

# Agregar capa de calor
HeatMap(heat_data).add_to(mapa)

# Guardar mapa
mapa.save('mapa_calor_señal.html')
```

#### Métricas Útiles para Mapas de Calor

| Métrica | Uso en Mapa de Calor | Interpretación |
|---------|---------------------|----------------|
| `downlink` | Velocidad de descarga | Mayor = Mejor señal |
| `rtt` | Latencia de red | Menor = Mejor conexión |
| `effectiveType` | Tipo de red (4G, 3G, etc.) | Categorización de zonas |
| `online` | Estado de conexión | Detección de zonas sin cobertura |

---

## Inicio Rápido

### Requisitos Previos

- Navegador compatible con PWA (Chrome, Edge, Firefox)
- Dispositivo Android con GPS activado
- Permisos de ubicación habilitados

### Instalación [Demo]

1. **Acceder a la aplicación**
    ```
   https://signal.rafalopez.ar/
   ```

2. **Instalar como PWA**
   - Hacer clic en el banner de instalación
   - O desde el menú del navegador: "Agregar a pantalla de inicio"

3. **Conceder permisos**
   - Permitir acceso a la ubicación cuando se solicite
   - Permitir acceso a información de red

---

## Uso

### Iniciar Rastreo

1. Abrir la aplicación
2. Presionar el botón **"▶ Iniciar"**
3. La app comenzará a recolectar datos automáticamente cada 15 segundos

### Detener Rastreo

- Presionar el botón **"⏹ Detener"** para pausar la recolección

### Visualizar Datos

- Hacer clic en **"Vista Previa"** para ver los primeros 50 registros
- El contador muestra el total de registros almacenados

### Descargar Datos

1. Presionar **"Descargar CSV"**
2. El archivo se descargará con formato: `geotracker_YYYY-MM-DD-HH-MM.csv`

### Limpiar Datos

- Presionar **"Limpiar Datos"** para borrar todos los registros almacenados
- Se solicitará confirmación antes de eliminar

---

## Formato de Datos CSV

Los datos se exportan en formato CSV con las siguientes columnas:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `timestamp` | Fecha y hora ISO 8601 | `2026-02-13T15:30:45.123Z` |
| `latitude` | Latitud GPS | `-34.603722` |
| `longitude` | Longitud GPS | `-58.381592` |
| `online` | Estado de conexión | `true` / `false` |
| `effectiveType` | Tipo de conexión efectiva | `4g`, `3g`, `2g`, `slow-2g` |
| `downlink` | Velocidad de descarga (Mbps) | `10.5` |
| `rtt` | Latencia de red (ms) | `50` |

### Ejemplo de CSV

```csv
timestamp,latitude,longitude,online,effectiveType,downlink,rtt
2026-02-13T15:30:45.123Z,-34.603722,-58.381592,true,4g,10.5,50
2026-02-13T15:31:00.456Z,-34.603845,-58.381701,true,4g,12.3,45
```

---

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con gradientes y animaciones
- **JavaScript (ES6+)** - Lógica de la aplicación
- **Service Workers** - Funcionalidad offline y caché
- **Geolocation API** - Acceso a GPS
- **Network Information API** - Datos de conexión
- **LocalStorage** - Almacenamiento persistente
- **Web App Manifest** - Configuración PWA

---

## Estructura del Proyecto

```
pwa_log_con_gps/
├── index.html           # Página principal
├── app.js              # Lógica de la aplicación
├── service-worker.js   # Service Worker para PWA
├── manifest.json       # Configuración PWA
└── README.md          # Este archivo
```

---

## Configuración

### Parámetros Modificables en `app.js`

```javascript
const CONFIG = {
    INTERVAL_MS: 15000,           // Intervalo de muestreo (ms)
    STORAGE_KEY: 'geotracker_csv', // Clave de almacenamiento
    MAX_PREVIEW_LINES: 50,        // Líneas en vista previa
    CSV_HEADER: '...'             // Encabezados del CSV
};
```

### ⚠️ IMPORTANTE: Actualización de Versión de Caché

**Cada vez que modifiques archivos del proyecto, DEBES actualizar la versión del caché en `service-worker.js`:**

```javascript
// service-worker.js
const NOMBRE_CACHE = 'aplicacion-v3.1.6';  // ← CAMBIAR ESTA VERSIÓN
```

#### Cuándo actualizar la versión:

- ✅ Modificaste `index.html`
- ✅ Modificaste `app.js`
- ✅ Modificaste `manifest.json`
- ✅ Modificaste estilos CSS
- ✅ Agregaste nuevos archivos

#### Proceso de actualización:

1. **Incrementar la versión** (ej: `v3.1.6` → `v3.1.7`)
2. **Guardar el archivo** `service-worker.js`
3. **Recargar la aplicación** en el navegador
4. **Verificar** que el Service Worker se actualice

#### Formato de versionado recomendado:

```
v[MAJOR].[MINOR].[PATCH]

Ejemplos:
- v3.1.6  → Versión actual
- v3.1.7  → Corrección de bugs
- v3.2.0  → Nueva funcionalidad menor
- v4.0.0  → Cambios importantes
```

> ** Tip:** Si no actualizas la versión del caché, los usuarios seguirán viendo la versión antigua de los archivos debido al caché del Service Worker.

### Opciones de Geolocalización

```javascript
{
    enableHighAccuracy: true,  // Máxima precisión GPS
    timeout: 10000,           // Timeout de 10 segundos
    maximumAge: 5000          // Edad máxima del caché
}
```

---

## Privacidad y Seguridad

### Garantías de Privacidad

- ✔️ **Almacenamiento 100% local** - Los datos nunca salen del dispositivo
- ✔️ **Sin servidores externos** - No hay comunicación con APIs remotas
- ✔️ **Control total del usuario** - Puedes borrar los datos en cualquier momento
- ✔️ **Código abierto** - Puedes revisar el código fuente

### ⚠️ Consideraciones

- Los datos se almacenan en `localStorage` del navegador
- Si borras los datos del navegador, perderás los registros
- Se recomienda exportar regularmente los datos a CSV

---

## Limitaciones en Android

### Restricciones del Sistema

- ❌ **No funciona en background** - La app debe estar abierta para recolectar datos
- ⚠️ **Requiere GPS activado** - El dispositivo debe tener GPS habilitado
- ⚠️ **Consumo de batería** - El uso prolongado puede afectar la batería
- ⚠️ **Precisión variable** - Depende de la calidad de la señal GPS

### Recomendaciones de Uso

1. Mantener la pantalla encendida durante el rastreo
2. Usar en áreas con buena cobertura GPS
3. Descargar datos periódicamente
4. Cerrar otras aplicaciones para optimizar rendimiento

---

## Solución de Problemas

### La app no obtiene ubicación

- ✅ Verificar que el GPS esté activado
- ✅ Conceder permisos de ubicación
- ✅ Asegurarse de estar en un área con señal GPS

### Los datos no se guardan

- ✅ Verificar que el navegador permita `localStorage`
- ✅ Comprobar espacio disponible en el dispositivo
- ✅ No usar modo incógnito/privado

### La app no se instala

- ✅ Usar un navegador compatible (Chrome, Edge)
- ✅ Verificar conexión HTTPS (requerida para PWA)
- ✅ Actualizar el navegador a la última versión

---

## Actualizaciones

### Versión 3.1.6 (Actual)

- Interfaz mejorada con diseño moderno
- Correcciones de estabilidad
- Optimización del formato CSV
- Mejoras visuales y de UX

### Historial de Versiones

Ver el archivo `CHANGELOG.md` para el historial completo de cambios.

---

## Desarrollo

### Ejecutar Localmente

```bash
# Clonar el repositorio
git clone https://github.com/raffarraffa/pwa_log_con_gps.git

# Navegar al directorio
cd pwa_log_con_gps

# Servir con un servidor HTTP local
python -m http.server 8000
# O usar cualquier otro servidor HTTP
```

### Testing

Abrir en el navegador:
```
http://localhost:8000
```

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Autor

**Rafael Lopez**

- LinkedIn: [enrique-rafael-lopez](https://www.linkedin.com/in/enrique-rafael-lopez/)
- GitHub: [@raffarraffa](https://github.com/raffarraffa)

---

## Agradecimientos

- Comunidad de desarrolladores PWA
- Contribuidores del proyecto
- Usuarios que reportan bugs y sugerencias

---

## Soporte

Si encuentras algún problema o tienes sugerencias:

- [Reportar un bug](https://github.com/raffarraffa/pwa_log_con_gps/issues)
- [Solicitar una feature](https://github.com/raffarraffa/pwa_log_con_gps/issues)
- Contacto directo vía LinkedIn

---

## 🔗 Enlaces Útiles

- [Documentación de PWA](https://web.dev/progressive-web-apps/)
- [Geolocation API](https://developer.mozilla.org/es/docs/Web/API/Geolocation_API)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Service Workers](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)

---

<div align="center">

** Si te resulta útil este proyecto, considera darle una estrella en GitHub **

</div>
