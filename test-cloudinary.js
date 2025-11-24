// Script de prueba para verificar conexión con Cloudinary
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinaryConnection() {
    try {
        console.log('🔄 Probando conexión con Cloudinary...');
        console.log('📊 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        
        // Obtener información de la cuenta
        const result = await cloudinary.api.ping();
        
        console.log('✅ ¡Conexión exitosa con Cloudinary!');
        console.log('📋 Resultado:', result);
        
        // Obtener uso actual
        const usage = await cloudinary.api.usage();
        console.log('💾 Uso actual:', {
            credits: usage.credits,
            objects: usage.objects,
            bandwidth: usage.bandwidth,
            storage: usage.storage
        });
        
    } catch (error) {
        console.error('❌ Error conectando con Cloudinary:');
        console.error('🔍 Detalles:', error.message);
        
        if (error.http_code === 401) {
            console.error('🚨 Error de autenticación - Verifica tus credenciales');
        }
    }
}

testCloudinaryConnection();