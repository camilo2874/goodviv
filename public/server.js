const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Permitir CORS para acceso externo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Si es la raíz, servir index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Error del servidor</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en:`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Red:   http://${getLocalIP()}:${PORT}`);
    console.log('📍 Aplicación de ubicaciones lista para usar!');
    console.log('⚠️  Recuerda permitir el acceso a tu ubicación cuando el navegador lo solicite.');
    console.log('');
    console.log('� DIARIO REGIONAL:');
    console.log(`📰 Noticias:  http://${getLocalIP()}:${PORT}/news.html`);
    console.log(`🕵️‍♂️ Panel:    http://${getLocalIP()}:${PORT}/`);
    console.log('');
    console.log('� PARA PROBAR LA GEOLOCALIZACIÓN:');
    console.log('1. Abre news.html en tu navegador');
    console.log('2. Haz clic en "Verificar Impacto en Mi Área"');
    console.log('3. Permite acceso a ubicación');
    console.log('4. Revisa el panel de control para ver los datos');
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}