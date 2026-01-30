const http = require('http');

const PORT = 3002;

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publicidad Falsa (Mock)</title>
    <style>
        body {
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
            font-family: sans-serif;
            color: white;
            text-align: center;
        }
        h1 { font-size: 3rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .status { font-size: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; }
    </style>
</head>
<body>
    <h1>📺 PUBLICIDAD (MOCK)</h1>
    <p class="status" id="status">Cargando contenido...</p>
    
    <!-- Elemento dummy para simular que hay video o imagen -->
    <img src="" style="display:none;" id="dummy-content">

    <script>
        const statusEl = document.getElementById('status');
        
        // Simular tiempo de carga de 2 segundos
        let timeLeft = 2;
        
        const timer = setInterval(() => {
            statusEl.textContent = 'Cargando contenido en ' + timeLeft + 's...';
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timer);
                sendSignal();
            }
        }, 1000);

        function sendSignal() {
            statusEl.textContent = '✅ ¡SEÑAL ENVIADA AL KIOSCO!';
            statusEl.style.background = '#4CAF50';
            
            // --- AQUÍ ESTÁ LA LÓGICA QUE DEBES IMPLEMENTAR EN EL SITIO REAL ---
            console.log('Enviando postMessage al padre...');
            
            // Detectamos si es imagen o video (aquí simulado como imagen)
            const type = 'image'; 
            
            window.parent.postMessage({
                type: 'IDLE_CONTENT_INFO',
                contentType: type
            }, '*');
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    // Headers para permitir CORS y que el iframe cargue sin problemas locales
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(200);
    res.end(htmlContent);
});

server.listen(PORT, () => {
    console.log(`\n🚀 Servidor de Publicidad Falsa corriendo en: http://localhost:${PORT}`);
    console.log(`   El iframe cargará esta URL.`);
});
