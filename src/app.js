const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

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
            imgSrc: ["'self'", "data:", "*"],
            crossOriginEmbedderPolicy: false
        }
    }
}));

// Rate limiting global - Configuración por ambiente
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 en desarrollo, 100 en producción
    message: {
        error: 'Demasiadas peticiones, intenta de nuevo más tarde.'
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
        documentacion: '/api-docs'
    });
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
        return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Enviar archivo
    res.sendFile(filePath);
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