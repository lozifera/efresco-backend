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
app.use(helmet());

// Rate limiting global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
        error: 'Demasiadas peticiones, intenta de nuevo más tarde.'
    }
});
app.use('/api/', limiter);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración CORS más específica
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
}));

// Middleware específico para archivos estáticos con CORS
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res, _path) => {
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

// Endpoint específico para imágenes con CORS
app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    // Headers CORS específicos para imágenes
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Verificar si el archivo existe
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Enviar archivo con tipo MIME correcto
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