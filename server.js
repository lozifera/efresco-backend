const app = require('./src/app');
const { sequelize } = require('./src/models');
const poblarDatosIniciales = require('./src/utils/seed');

// Usar el puerto que Render asigna o 3001 para desarrollo local
const port = process.env.PORT || 3001;

console.log('🔧 DEBUG INFO:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT env var: ${process.env.PORT}`);
console.log(`   Final port: ${port}`);
console.log(`   Platform: ${process.platform}`);

// Iniciar el servidor INMEDIATAMENTE
const server = app.listen(port, '0.0.0.0', () => {
    // URLs inteligentes según el ambiente
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
        ? 'https://efresco-backend.onrender.com'
        : `http://localhost:${port}`;
    
    console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
    console.log(`📚 Documentación Swagger en ${baseUrl}/api-docs`);
    console.log(`🔗 URL para frontend: ${baseUrl}/api`);
    console.log(`🌍 Puerto: ${port}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`✅ Servidor iniciado correctamente`);
    
    if (!isProduction) {
        console.log(`💡 Desarrollo local - Usa: http://localhost:${port}/api-docs`);
    }
});

server.on('error', (err) => {
    console.error(`❌ Error del servidor:`, err);
});

// Inicializar base de datos EN PARALELO (no bloqueante)
sequelize.sync({ force: false })
    .then(() => {
        console.log('✅ Tablas sincronizadas correctamente.');
        return poblarDatosIniciales();
    })
    .then(() => {
        console.log('✅ Base de datos inicializada completamente.');
    })
    .catch((err) => {
        console.error('❌ Error en BD (pero servidor sigue funcionando):', err.message);
    });