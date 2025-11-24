const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configurar trust proxy para Render (necesario para rate limiting)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
}

// Configurar Swagger
const swaggerSetup = require('./config/swagger.config');

// Middlewares de seguridad
app.use(helmet({
    crossOriginResourcePolicy: { 
        policy: "cross-origin" 
    },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "*"]
        }
    }
}));

// Rate limiting global - Configuración por ambiente
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 en desarrollo, 100 en producción
    message: {
        error: 'Demasiadas peticiones, intenta de nuevo más tarde.'
    },
    // Configuración específica para Render
    trustProxy: true,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    }
});
app.use('/api/', limiter);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware específico para Render - Forzar HTTPS y evitar redirecciones
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Forzar HTTPS en Render
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        
        // Evitar trailing slash en rutas de archivos estáticos
        if (req.path.startsWith('/uploads') && req.path.endsWith('/') && req.path.length > 9) {
            return res.redirect(301, req.path.slice(0, -1));
        }
        
        next();
    });
}

// Configuración CORS simple y efectiva
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:5173', 
        'https://efresco-frontend.onrender.com',
        'https://efresco-backend.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));


// Middleware simple para archivos estáticos con CORS
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// Servir archivos estáticos con CORS simple
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Configurar Swagger UI
swaggerSetup(app);

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API EFresco funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentacion: '/api-docs',
        debug: '/debug/uploads'
    });
});

// Página de prueba para imágenes
app.get('/test-images.html', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test de Imágenes EFresco</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            img { border: 1px solid #ccc; margin: 10px; border-radius: 4px; }
            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #45a049; }
            .success { color: #4CAF50; font-weight: bold; }
            .error { color: #f44336; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 Test de Imágenes EFresco</h1>
            
            <div class="test-section">
                <h2>1. Estado del Servidor</h2>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>NODE_ENV:</strong> ${process.env.NODE_ENV}</p>
                <button onclick="checkUploadsDir()">Verificar Directorio Uploads</button>
                <div id="uploadsResult"></div>
            </div>
            
            <div class="test-section">
                <h2>2. Test de CORS</h2>
                <button onclick="testCORS()">Test CORS desde Frontend</button>
                <div id="corsResult"></div>
                
                <h2>3. Test de Método PATCH</h2>
                <button onclick="testPATCH()">Test Método PATCH</button>
                <div id="patchResult"></div>
            </div>
            
            <div class="test-section">
                <h2>4. Upload Test</h2>
                <input type="file" id="fileInput" accept="image/*">
                <button onclick="testUpload()">Subir Imagen de Prueba</button>
                <div id="uploadResult"></div>
            </div>
        </div>
        
        <script>
            async function checkUploadsDir() {
                const result = document.getElementById('uploadsResult');
                try {
                    const response = await fetch('/debug/uploads');
                    const data = await response.json();
                    result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    result.className = response.ok ? 'success' : 'error';
                } catch (error) {
                    result.innerHTML = '❌ Error: ' + error.message;
                    result.className = 'error';
                }
            }
            
            async function testCORS() {
                const result = document.getElementById('corsResult');
                try {
                    const response = await fetch('/debug/uploads', {
                        headers: {
                            'Origin': 'http://localhost:4200'
                        }
                    });
                    result.innerHTML = '✅ CORS funcionando correctamente - Status: ' + response.status;
                    result.className = 'success';
                } catch (error) {
                    result.innerHTML = '❌ Error CORS: ' + error.message;
                    result.className = 'error';
                }
            }
            
            async function testPATCH() {
                const result = document.getElementById('patchResult');
                try {
                    const response = await fetch('/debug/test-patch', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ test: 'patch funcionando' })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        result.innerHTML = '✅ Método PATCH funcionando - ' + data.mensaje;
                        result.className = 'success';
                    } else {
                        result.innerHTML = '❌ Error PATCH - Status: ' + response.status;
                        result.className = 'error';
                    }
                } catch (error) {
                    result.innerHTML = '❌ Error PATCH: ' + error.message;
                    result.className = 'error';
                }
            }
            
            async function testUpload() {
                const fileInput = document.getElementById('fileInput');
                const result = document.getElementById('uploadResult');
                
                if (!fileInput.files[0]) {
                    result.innerHTML = '❌ Selecciona una imagen primero';
                    result.className = 'error';
                    return;
                }
                
                const formData = new FormData();
                formData.append('imagen', fileInput.files[0]);
                
                try {
                    const response = await fetch('/api/test-upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    result.className = response.ok ? 'success' : 'error';
                } catch (error) {
                    result.innerHTML = '❌ Error upload: ' + error.message;
                    result.className = 'error';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Endpoint simple para imágenes con CORS básico
app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    // Headers CORS simples pero efectivos
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Verificar si el archivo existe
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Imagen no encontrada: ${filename} en ${filePath}`);
        return res.status(404).json({ 
            error: 'Imagen no encontrada',
            filename: filename,
            path: filePath,
            exists: false
        });
    }
    
    console.log(`✅ Enviando imagen: ${filename}`);
    // Enviar archivo
    res.sendFile(filePath);
});

// Endpoint para debug - listar archivos en uploads
app.get('/debug/uploads', (req, res) => {
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'public/uploads');
    
    try {
        // Verificar si el directorio existe
        if (!fs.existsSync(uploadsDir)) {
            return res.json({
                message: 'Directorio uploads no existe',
                path: uploadsDir,
                files: []
            });
        }
        
        // Listar archivos
        const files = fs.readdirSync(uploadsDir);
        res.json({
            message: 'Archivos en directorio uploads',
            path: uploadsDir,
            totalFiles: files.length,
            files: files
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error leyendo directorio uploads',
            message: error.message
        });
    }
});

// Importar rutas
const usuariosRoutes = require('./routes/usuarios.routes');
const productosRoutes = require('./routes/productos.routes');
const anunciosRoutes = require('./routes/anuncios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const pagosQrRoutes = require('./routes/pagosQr.routes');
const comentariosRoutes = require('./routes/comentarios.routes');
const reputacionRoutes = require('./routes/reputacion.routes');
const favoritosRoutes = require('./routes/favoritos.routes');
const membresiasRoutes = require('./routes/membresias.routes');
const chatRoutes = require('./routes/chat.routes');

// Endpoint de test para upload
const multer = require('multer');
const uploadTest = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, 'public/uploads'));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'test-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.post('/api/test-upload', uploadTest.single('imagen'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            mensaje: 'Imagen subida exitosamente',
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            url: imageUrl,
            fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
            path: req.file.path
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en upload', message: error.message });
    }
});

// Endpoint de prueba para método PATCH
app.patch('/debug/test-patch', (req, res) => {
    res.json({
        mensaje: 'Método PATCH funcionando correctamente',
        timestamp: new Date().toISOString(),
        datos_recibidos: req.body,
        metodo: req.method,
        url: req.url
    });
});

// Usar rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagos-qr', pagosQrRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/reputacion', reputacionRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/membresias', membresiasRoutes);
app.use('/api/chat', chatRoutes);

// Middleware de manejo de errores
app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;