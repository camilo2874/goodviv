// Configuración del mapa
let map;
let currentLocationMarker;
let sharedLocationMarker;
let savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
let locationRequests = JSON.parse(localStorage.getItem('locationRequests') || '{}');
let receivedLocations = JSON.parse(localStorage.getItem('receivedLocations') || '{}');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadSavedLocations();
    setupEventListeners();
    
    // Verificar si hay una ubicación en la URL
    checkUrlForLocation();
});

// Inicializar el mapa
function initializeMap() {
    // Coordenadas por defecto (Colombia, Bogotá)
    const defaultLat = 4.7110;
    const defaultLng = -74.0721;
    
    map = L.map('map').setView([defaultLat, defaultLng], 6);
    
    // Añadir capa de mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Función mejorada de geolocalización con fallbacks
function improvedGeolocation(successCallback, errorCallback, options) {
    if (!navigator.geolocation) {
        errorCallback({
            code: 999,
            message: 'Geolocalización no soportada'
        });
        return;
    }
    
    // Primero intentar con alta precisión
    navigator.geolocation.getCurrentPosition(
        successCallback,
        function(error) {
            console.log('⚠️ Primer intento falló, intentando con configuración menos estricta...');
            
            // Si falla, intentar con configuración menos estricta
            const fallbackOptions = {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 300000 // 5 minutos
            };
            
            navigator.geolocation.getCurrentPosition(
                successCallback,
                errorCallback,
                fallbackOptions
            );
        },
        options
    );
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('getLocationBtn').addEventListener('click', getCurrentLocation);
    document.getElementById('generateUrlBtn').addEventListener('click', generateShareUrl);
    document.getElementById('loadSharedLocationBtn').addEventListener('click', loadSharedLocation);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllLocations);
    
    // Nuevos event listeners para solicitar ubicaciones
    document.getElementById('createRequestBtn').addEventListener('click', createLocationRequest);
    document.getElementById('viewReceivedBtn').addEventListener('click', viewReceivedLocations);
}

// Obtener ubicación actual
function getCurrentLocation() {
    const btn = document.getElementById('getLocationBtn');
    const locationDiv = document.getElementById('currentLocation');
    
    console.log('📍 Intentando obtener ubicación actual...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocalización no soportada');
        showLocationInfo('Tu navegador no soporta geolocalización.', 'error');
        return;
    }
    
    // Verificar protocolo HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('⚠️ Advertencia: Geolocalización puede no funcionar sin HTTPS');
        showLocationInfo('Advertencia: Para mejor funcionamiento, usa HTTPS.', 'warning');
    }
    
    // Mostrar estado de carga
    btn.innerHTML = '<span class="loading"></span> Obteniendo ubicación...';
    btn.disabled = true;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };
    
    improvedGeolocation(
        function(position) {
            console.log('✅ Ubicación obtenida exitosamente:', position.coords);
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Mostrar información de ubicación
            showLocationInfo(`
                <strong>📍 Ubicación obtenida:</strong><br>
                Latitud: ${lat.toFixed(6)}<br>
                Longitud: ${lng.toFixed(6)}<br>
                Precisión: ±${Math.round(accuracy)} metros
            `, 'success');
            
            // Actualizar mapa
            map.setView([lat, lng], 16);
            
            // Añadir/actualizar marcador
            if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
            }
            
            currentLocationMarker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <strong>Tu ubicación actual</strong><br>
                    Lat: ${lat.toFixed(6)}<br>
                    Lng: ${lng.toFixed(6)}<br>
                    Precisión: ±${Math.round(accuracy)}m
                `)
                .openPopup();
            
            // Mostrar sección de compartir
            document.getElementById('shareSection').style.display = 'block';
            
            // Resetear botón
            btn.innerHTML = '📍 Obtener Mi Ubicación';
            btn.disabled = false;
        },
        function(error) {
            console.error('❌ Error de geolocalización:', error);
            
            let errorMessage = 'Error al obtener la ubicación: ';
            let showInstructions = false;
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    console.error('🚫 Permiso de ubicación denegado');
                    errorMessage += 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
                    showInstructions = true;
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.error('📍 Ubicación no disponible');
                    errorMessage += 'Ubicación no disponible. Verifica que tengas GPS activado.';
                    break;
                case error.TIMEOUT:
                    console.error('⏰ Timeout de geolocalización');
                    errorMessage += 'Tiempo de espera agotado. Inténtalo de nuevo.';
                    break;
                case 999:
                    console.error('🚫 Geolocalización no soportada');
                    errorMessage += 'Tu navegador no soporta geolocalización.';
                    break;
                default:
                    console.error('❓ Error desconocido:', error.code, error.message);
                    errorMessage += 'Error desconocido.';
                    break;
            }
            
            if (showInstructions) {
                errorMessage += `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 15px; margin: 15px 0; text-align: left;">
                        <strong>💡 Cómo habilitar ubicación:</strong><br>
                        • Haz clic en el icono 🔒 o ℹ️ en la barra de direcciones<br>
                        • Permite "ubicación" para este sitio<br>
                        • Recarga la página y vuelve a intentar
                    </div>
                `;
            }
            
            showLocationInfo(errorMessage, 'error');
            
            // Resetear botón
            btn.innerHTML = '📍 Obtener Mi Ubicación';
            btn.disabled = false;
        },
        options
    );
}

// Mostrar información de ubicación
function showLocationInfo(message, type = 'info') {
    const locationDiv = document.getElementById('currentLocation');
    locationDiv.innerHTML = message;
    locationDiv.className = `location-info ${type} fade-in`;
}

// Generar URL para compartir
function generateShareUrl() {
    if (!currentLocationMarker) {
        alert('Primero debes obtener tu ubicación actual.');
        return;
    }
    
    const position = currentLocationMarker.getLatLng();
    const name = document.getElementById('locationName').value.trim();
    const description = document.getElementById('locationDescription').value.trim();
    
    // Crear objeto de ubicación
    const locationData = {
        lat: position.lat,
        lng: position.lng,
        name: name || 'Ubicación compartida',
        description: description || '',
        timestamp: new Date().toISOString(),
        id: generateId()
    };
    
    // Crear URL con parámetros
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        lat: position.lat.toString(),
        lng: position.lng.toString(),
        name: locationData.name,
        desc: locationData.description,
        id: locationData.id
    });
    
    const shareUrl = `${baseUrl}?${params.toString()}`;
    
    // Mostrar URL generada
    const urlDiv = document.getElementById('generatedUrl');
    urlDiv.innerHTML = `
        <h4>🔗 URL generada:</h4>
        <div class="copy-url" onclick="copyToClipboard('${shareUrl}')" title="Clic para copiar">
            ${shareUrl}
        </div>
        <div style="margin-top: 10px;">
            <button class="btn primary" onclick="copyToClipboard('${shareUrl}')">📋 Copiar URL</button>
            <button class="btn secondary" onclick="shareViaWhatsApp('${shareUrl}', '${locationData.name}')">💬 Compartir por WhatsApp</button>
        </div>
    `;
    urlDiv.className = 'url-result show fade-in';
    
    // Guardar ubicación
    saveLocation(locationData);
}

// Cargar ubicación compartida
function loadSharedLocation() {
    const urlInput = document.getElementById('sharedUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Por favor, ingresa una URL válida.');
        return;
    }
    
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        
        const lat = parseFloat(params.get('lat'));
        const lng = parseFloat(params.get('lng'));
        const name = params.get('name') || 'Ubicación compartida';
        const description = params.get('desc') || '';
        
        if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Coordenadas inválidas');
        }
        
        showSharedLocation(lat, lng, name, description);
        
    } catch (error) {
        alert('URL inválida. Por favor, verifica que la URL sea correcta.');
    }
}

// Mostrar ubicación compartida en el mapa
function showSharedLocation(lat, lng, name, description) {
    // Centrar mapa en la ubicación
    map.setView([lat, lng], 16);
    
    // Eliminar marcador anterior si existe
    if (sharedLocationMarker) {
        map.removeLayer(sharedLocationMarker);
    }
    
    // Crear icono personalizado para ubicación compartida
    const sharedIcon = L.divIcon({
        html: '📍',
        iconSize: [30, 30],
        className: 'shared-location-icon'
    });
    
    // Añadir marcador
    sharedLocationMarker = L.marker([lat, lng], { icon: sharedIcon })
        .addTo(map)
        .bindPopup(`
            <div style="min-width: 200px;">
                <h4>${name}</h4>
                ${description ? `<p>${description}</p>` : ''}
                <p><strong>Coordenadas:</strong><br>
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}</p>
                <div style="margin-top: 10px;">
                    <button onclick="openInGoogleMaps(${lat}, ${lng})" class="btn primary" style="font-size: 0.8rem; padding: 5px 10px;">
                        🗺️ Abrir en Google Maps
                    </button>
                </div>
            </div>
        `)
        .openPopup();
    
    // Limpiar el campo de URL
    document.getElementById('sharedUrl').value = '';
}

// Verificar si hay una ubicación en la URL actual
function checkUrlForLocation() {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const requestId = params.get('request');
    
    if (requestId) {
        // Es una solicitud de ubicación
        handleLocationRequest(requestId);
    } else if (lat && lng) {
        const name = params.get('name') || 'Ubicación compartida';
        const description = params.get('desc') || '';
        
        showSharedLocation(parseFloat(lat), parseFloat(lng), name, description);
        
        // Limpiar la URL para evitar confusiones
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Guardar ubicación en localStorage
function saveLocation(locationData) {
    savedLocations.unshift(locationData);
    
    // Mantener solo las últimas 10 ubicaciones
    if (savedLocations.length > 10) {
        savedLocations = savedLocations.slice(0, 10);
    }
    
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    loadSavedLocations();
}

// Cargar ubicaciones guardadas
function loadSavedLocations() {
    const container = document.getElementById('savedLocationsList');
    
    if (savedLocations.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">No hay ubicaciones guardadas.</p>';
        return;
    }
    
    container.innerHTML = savedLocations.map(location => `
        <div class="saved-location-item" onclick="showSavedLocation(${location.lat}, ${location.lng}, '${location.name}', '${location.description}')">
            <h4>${location.name}</h4>
            ${location.description ? `<p>${location.description}</p>` : ''}
            <p class="coordinates">Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}</p>
            <p style="font-size: 0.8rem; color: #95a5a6;">
                Guardado: ${new Date(location.timestamp).toLocaleString()}
            </p>
        </div>
    `).join('');
}

// Mostrar ubicación guardada
function showSavedLocation(lat, lng, name, description) {
    showSharedLocation(lat, lng, name, description);
}

// Limpiar todas las ubicaciones
function clearAllLocations() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las ubicaciones guardadas?')) {
        savedLocations = [];
        localStorage.removeItem('savedLocations');
        loadSavedLocations();
    }
}

// Funciones auxiliares
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.textContent = '¡URL copiada al portapapeles!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }).catch(function() {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('URL copiada al portapapeles');
    });
}

function shareViaWhatsApp(url, locationName) {
    const message = encodeURIComponent(`¡Hola! Te comparto mi ubicación: "${locationName}"\n\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function openInGoogleMaps(lat, lng) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
}

// ============ NUEVAS FUNCIONES PARA SOLICITAR UBICACIONES ============

// Crear solicitud de ubicación
function createLocationRequest() {
    const title = document.getElementById('requestTitle').value.trim();
    const message = document.getElementById('requestMessage').value.trim();
    
    if (!title) {
        alert('Por favor, ingresa un título para la solicitud.');
        return;
    }
    
    // Generar ID único para la solicitud
    const requestId = generateRequestId();
    
    // Crear objeto de solicitud
    const request = {
        id: requestId,
        title: title,
        message: message || 'Por favor, comparte tu ubicación',
        created: new Date().toISOString(),
        locations: []
    };
    
    // Guardar solicitud
    locationRequests[requestId] = request;
    localStorage.setItem('locationRequests', JSON.stringify(locationRequests));
    
    // Crear URL de solicitud
    const baseUrl = window.location.origin + window.location.pathname;
    const requestUrl = `${baseUrl}?request=${requestId}`;
    
    // Mostrar resultado
    const resultDiv = document.getElementById('requestResult');
    resultDiv.innerHTML = `
        <h4>✅ Solicitud Creada</h4>
        <div class="request-id-display">
            <h4>📋 ID de tu solicitud:</h4>
            <div class="request-id-code" onclick="copyToClipboard('${requestId}')" title="Clic para copiar">
                ${requestId}
            </div>
            <p style="font-size: 0.9rem; color: #6c757d; margin-top: 10px;">
                ⚠️ Guarda este ID para ver las ubicaciones recibidas
            </p>
        </div>
        <h4>🔗 Enlace para enviar a tus amigos:</h4>
        <div class="copy-url" onclick="copyToClipboard('${requestUrl}')" title="Clic para copiar">
            ${requestUrl}
        </div>
        <div style="margin-top: 15px;">
            <button class="btn primary" onclick="copyToClipboard('${requestUrl}')">📋 Copiar Enlace</button>
            <button class="btn secondary" onclick="shareLocationRequestViaWhatsApp('${requestUrl}', '${title}', '${message}')">💬 Enviar por WhatsApp</button>
        </div>
    `;
    resultDiv.className = 'url-result show fade-in';
    
    // Limpiar campos
    document.getElementById('requestTitle').value = '';
    document.getElementById('requestMessage').value = '';
}

// Manejar solicitud de ubicación (cuando alguien abre el enlace)
function handleLocationRequest(requestId) {
    const request = locationRequests[requestId];
    
    if (!request) {
        alert('Solicitud no encontrada o expirada.');
        return;
    }
    
    // Mostrar mensaje personalizado
    const headerTitle = document.querySelector('header h1');
    const headerDesc = document.querySelector('header p');
    
    headerTitle.textContent = `📍 ${request.title}`;
    headerDesc.textContent = request.message;
    
    // Ocultar otras secciones y mostrar solo la de ubicación
    document.querySelector('.request-section').style.display = 'none';
    document.querySelector('.received-section').style.display = 'none';
    document.querySelector('.share-section').style.display = 'none';
    document.querySelector('.url-section').style.display = 'none';
    document.querySelector('.saved-locations').style.display = 'none';
    
    // Modificar la sección de ubicación para el contexto de solicitud
    const locationSection = document.querySelector('.location-section');
    locationSection.innerHTML = `
        <h3>📍 Compartir Mi Ubicación</h3>
        <p style="color: #7f8c8d; margin-bottom: 15px;">${request.message}</p>
        <button id="shareLocationForRequestBtn" class="btn success">📤 Compartir Mi Ubicación</button>
        <div id="shareLocationResult" class="location-info"></div>
    `;
    
    // Configurar el botón
    document.getElementById('shareLocationForRequestBtn').addEventListener('click', function() {
        shareLocationForRequest(requestId);
    });
    
    // Limpiar la URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Compartir ubicación para una solicitud específica
function shareLocationForRequest(requestId) {
    const btn = document.getElementById('shareLocationForRequestBtn');
    const resultDiv = document.getElementById('shareLocationResult');
    
    if (!navigator.geolocation) {
        showLocationInfo('Tu navegador no soporta geolocalización.', 'error');
        return;
    }
    
    // Mostrar estado de carga
    btn.innerHTML = '<span class="loading"></span> Obteniendo ubicación...';
    btn.disabled = true;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Pedir nombre del usuario
            const userName = prompt('¿Cuál es tu nombre?', '');
            if (!userName) {
                btn.innerHTML = '📤 Compartir Mi Ubicación';
                btn.disabled = false;
                return;
            }
            
            // Crear objeto de ubicación
            const locationData = {
                lat: lat,
                lng: lng,
                accuracy: accuracy,
                userName: userName.trim(),
                timestamp: new Date().toISOString(),
                id: generateId()
            };
            
            // Guardar en las ubicaciones recibidas
            if (!receivedLocations[requestId]) {
                receivedLocations[requestId] = [];
            }
            receivedLocations[requestId].push(locationData);
            localStorage.setItem('receivedLocations', JSON.stringify(receivedLocations));
            
            // Mostrar confirmación
            resultDiv.innerHTML = `
                <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                    <strong>✅ ¡Ubicación compartida exitosamente!</strong><br>
                    Nombre: ${userName}<br>
                    Precisión: ±${Math.round(accuracy)} metros<br>
                    <br>
                    <em>Tus amigos ya pueden ver tu ubicación.</em>
                </div>
            `;
            resultDiv.className = 'location-info fade-in';
            
            // Mostrar en el mapa
            map.setView([lat, lng], 16);
            
            if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
            }
            
            currentLocationMarker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <strong>${userName}</strong><br>
                    Ubicación compartida<br>
                    Precisión: ±${Math.round(accuracy)}m
                `)
                .openPopup();
            
            // Resetear botón
            btn.innerHTML = '✅ Ubicación Compartida';
            btn.disabled = true;
        },
        function(error) {
            let errorMessage = 'Error al obtener la ubicación: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Ubicación no disponible.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tiempo de espera agotado.';
                    break;
                default:
                    errorMessage += 'Error desconocido.';
                    break;
            }
            
            resultDiv.innerHTML = `<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">${errorMessage}</div>`;
            resultDiv.className = 'location-info fade-in';
            
            // Resetear botón
            btn.innerHTML = '📤 Compartir Mi Ubicación';
            btn.disabled = false;
        },
        options
    );
}

// Ver ubicaciones recibidas
function viewReceivedLocations() {
    const requestId = document.getElementById('requestId').value.trim();
    
    if (!requestId) {
        alert('Por favor, ingresa el ID de tu solicitud.');
        return;
    }
    
    const locations = receivedLocations[requestId];
    const container = document.getElementById('receivedLocations');
    
    if (!locations || locations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #7f8c8d;">
                <p>📭 No hay ubicaciones recibidas para este ID.</p>
                <p style="font-size: 0.9rem;">Asegúrate de que tus amigos hayan abierto el enlace y compartido su ubicación.</p>
            </div>
        `;
        return;
    }
    
    // Mostrar ubicaciones en el mapa
    clearMapMarkers();
    const bounds = [];
    
    // Crear contenido HTML
    container.innerHTML = `
        <h4>📍 ${locations.length} ubicación(es) recibida(s):</h4>
        ${locations.map((location, index) => `
            <div class="received-location-item" onclick="focusOnLocation(${location.lat}, ${location.lng}, '${location.userName}')">
                <div class="friend-info">👤 ${location.userName}</div>
                <p>📅 ${new Date(location.timestamp).toLocaleString()}</p>
                <p class="coordinates">📍 Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}</p>
                <p style="font-size: 0.8rem; color: #95a5a6;">Precisión: ±${Math.round(location.accuracy)}m</p>
            </div>
        `).join('')}
        <div style="margin-top: 15px;">
            <button class="btn primary" onclick="showAllLocationsOnMap('${requestId}')">🗺️ Ver Todas en el Mapa</button>
            <button class="btn secondary" onclick="exportLocations('${requestId}')">📤 Exportar Ubicaciones</button>
        </div>
    `;
    
    // Agregar marcadores al mapa
    showAllLocationsOnMap(requestId);
}

// Mostrar todas las ubicaciones en el mapa
function showAllLocationsOnMap(requestId) {
    const locations = receivedLocations[requestId];
    if (!locations || locations.length === 0) return;
    
    clearMapMarkers();
    const bounds = [];
    
    locations.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 150px;">
                    <h4>👤 ${location.userName}</h4>
                    <p><strong>📅 Hora:</strong><br>${new Date(location.timestamp).toLocaleString()}</p>
                    <p><strong>📍 Coordenadas:</strong><br>
                    ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
                    <p><strong>🎯 Precisión:</strong> ±${Math.round(location.accuracy)}m</p>
                    <button onclick="openInGoogleMaps(${location.lat}, ${location.lng})" class="btn primary" style="font-size: 0.8rem; padding: 5px 10px; margin-top: 10px;">
                        🗺️ Abrir en Google Maps
                    </button>
                </div>
            `);
        
        bounds.push([location.lat, location.lng]);
    });
    
    // Ajustar vista del mapa para mostrar todas las ubicaciones
    if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [20, 20] });
    } else if (bounds.length === 1) {
        map.setView(bounds[0], 16);
    }
}

// Enfocar en una ubicación específica
function focusOnLocation(lat, lng, userName) {
    map.setView([lat, lng], 18);
    
    // Encontrar y abrir el popup del marcador
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            const pos = layer.getLatLng();
            if (Math.abs(pos.lat - lat) < 0.00001 && Math.abs(pos.lng - lng) < 0.00001) {
                layer.openPopup();
            }
        }
    });
}

// Limpiar marcadores del mapa
function clearMapMarkers() {
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

// Exportar ubicaciones
function exportLocations(requestId) {
    const locations = receivedLocations[requestId];
    const request = locationRequests[requestId];
    
    if (!locations || locations.length === 0) {
        alert('No hay ubicaciones para exportar.');
        return;
    }
    
    let exportText = `📍 UBICACIONES RECIBIDAS\n`;
    exportText += `Solicitud: ${request ? request.title : 'Sin título'}\n`;
    exportText += `Fecha: ${new Date().toLocaleString()}\n`;
    exportText += `Total: ${locations.length} ubicación(es)\n\n`;
    
    locations.forEach((location, index) => {
        exportText += `${index + 1}. 👤 ${location.userName}\n`;
        exportText += `   📅 ${new Date(location.timestamp).toLocaleString()}\n`;
        exportText += `   📍 ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}\n`;
        exportText += `   🎯 Precisión: ±${Math.round(location.accuracy)}m\n`;
        exportText += `   🗺️ Google Maps: https://www.google.com/maps?q=${location.lat},${location.lng}\n\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ubicaciones_${requestId}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Compartir solicitud por WhatsApp
function shareLocationRequestViaWhatsApp(url, title, message) {
    const whatsappMessage = encodeURIComponent(`🗺️ ${title}\n\n${message}\n\n👆 Abre este enlace para compartir tu ubicación:\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Generar ID único para solicitudes
function generateRequestId() {
    return 'REQ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Añadir estilos CSS dinámicamente para el icono de ubicación compartida
const style = document.createElement('style');
style.textContent = `
    .shared-location-icon {
        background: transparent !important;
        border: none !important;
        font-size: 24px;
        text-align: center;
        line-height: 30px;
    }
`;
document.head.appendChild(style);