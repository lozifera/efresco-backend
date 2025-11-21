const app = require('./src/app');
const { sequelize } = require('./src/models');
const poblarDatosIniciales = require('./src/utils/seed');

// Usar el puerto que Render asigna o 3001 para desarrollo local
const port = process.env.PORT || 3001;

// Sincronizar modelos con la base de datos
sequelize.sync({ force: false }) // Cambiar a true solo si quieres recrear las tablas
    .then(() => {
        console.log('Tablas sincronizadas correctamente.');
        return poblarDatosIniciales();
    })
    .then(() => {
        console.log('Base de datos inicializada completamente.');
    })
    .catch((err) => {
        console.error('Error al sincronizar las tablas:', err);
    });
    
// Iniciar el servidor
app.listen(port, () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
    console.log(`📚 Documentación Swagger en http://localhost:${port}/api-docs`);
});