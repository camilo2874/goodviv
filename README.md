# 🗺️ Compartir Ubicaciones - Aplicación para Amigos

Una aplicación web simple y efectiva para compartir ubicaciones exactas mediante URLs entre tu grupo de amigos.

## ✨ Características

- 📍 **Obtener ubicación GPS actual** con alta precisión
- 🔗 **Generar URLs únicas** para compartir ubicaciones
- 🗺️ **Mapa interactivo** usando OpenStreetMap
- 💾 **Guardar ubicaciones** en el navegador
- 📱 **Compartir por WhatsApp** directamente
- 🎯 **Abrir en Google Maps** para navegación
- 📝 **Agregar nombres y descripciones** a las ubicaciones
- 💻 **Diseño responsivo** para móviles y desktop

## 🚀 Cómo usar

### 1. Compartir tu ubicación:
1. Abre `index.html` en tu navegador
2. Haz clic en "📍 Obtener Mi Ubicación"
3. Permite el acceso a tu ubicación cuando el navegador lo solicite
4. (Opcional) Agrega un nombre y descripción
5. Haz clic en "🔗 Generar URL para Compartir"
6. Copia la URL generada y compártela con tus amigos

### 2. Ver una ubicación compartida:
1. Pega la URL que te compartieron en el campo "Ver Ubicación Compartida"
2. Haz clic en "🔍 Ver Ubicación"
3. La ubicación aparecerá en el mapa con toda la información

### 3. Funciones adicionales:
- **Historial**: Todas las ubicaciones se guardan automáticamente
- **WhatsApp**: Comparte directamente por WhatsApp
- **Google Maps**: Abre cualquier ubicación en Google Maps para navegación
- **Limpiar**: Elimina todo el historial cuando lo desees

## 🔧 Instalación

### Opción 1: Usar directamente
1. Descarga todos los archivos (index.html, styles.css, script.js)
2. Abre `index.html` en cualquier navegador moderno
3. ¡Listo para usar!

### Opción 2: Servidor local (recomendado)
```bash
# Si tienes Python instalado:
python -m http.server 8000

# Si tienes Node.js instalado:
npx http-server

# Luego abre: http://localhost:8000
```

## 🌐 Cómo funcionan las URLs

Las URLs generadas contienen todos los datos necesarios:
```
https://tu-sitio.com/?lat=4.711000&lng=-74.072100&name=Mi%20Casa&desc=Ubicación%20de%20mi%20casa
```

Parámetros:
- `lat`: Latitud
- `lng`: Longitud  
- `name`: Nombre del lugar
- `desc`: Descripción

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge (versiones modernas)
- ✅ Android e iOS (navegadores móviles)
- ⚠️ Requiere HTTPS para geolocalización en sitios web públicos
- ⚠️ Requiere permisos de ubicación del usuario

## 🔒 Privacidad y Seguridad

- ✅ **No se envían datos a servidores externos** (excepto el mapa)
- ✅ **Todo funciona localmente** en tu navegador
- ✅ **Tú controlas qué ubicaciones compartes**
- ✅ **Las ubicaciones guardadas solo están en tu dispositivo**

## 🛠️ Personalización

### Cambiar el mapa por defecto:
En `script.js`, líneas 15-16:
```javascript
const defaultLat = 4.7110;  // Tu latitud
const defaultLng = -74.0721; // Tu longitud
```

### Cambiar el proveedor de mapas:
En `script.js`, línea 22:
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
```

## 🎯 Casos de uso perfectos

- 🏠 **Compartir direcciones exactas** de casas o apartamentos
- 🍕 **Ubicaciones de restaurantes** o lugares de encuentro
- 🎉 **Eventos y fiestas** con ubicación precisa
- 🚗 **Compartir donde estacionaste** el auto
- 🏖️ **Lugares turísticos** interesantes
- ⛑️ **Emergencias** - compartir ubicación rápidamente

## 🤝 Mejoras futuras (ideas)

- [ ] Servidor backend para URLs más cortas
- [ ] Fotos en las ubicaciones
- [ ] Grupos privados de amigos
- [ ] Notificaciones push
- [ ] Integración con más apps de mapas
- [ ] Modo offline básico

## 📞 Soporte

Si tienes problemas:
1. Verifica que tu navegador soporte geolocalización
2. Asegúrate de dar permisos de ubicación
3. Usa HTTPS si estás en un servidor web
4. Verifica que JavaScript esté habilitado

---

¡Disfruta compartiendo ubicaciones con tus amigos! 🎉