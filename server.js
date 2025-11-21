const app = require('./src/app');
const { sequelize } = require('./src/models');
const poblarDatosIniciales = require('./src/utils/seed');

// Usar el puerto que Render asigna o 3001 para desarrollo local
const port = process.env.PORT || 3001;

// Iniciar el servidor INMEDIATAMENTE
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
    console.log(`📚 Documentación Swagger en http://localhost:${port}/api-docs`);
    console.log(`🌍 Puerto: ${port}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
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