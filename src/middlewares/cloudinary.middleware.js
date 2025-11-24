const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Verificar configuración de Cloudinary
const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables de entorno de Cloudinary faltantes:', missingVars);
    console.error('📝 Asegúrate de configurar en Render:');
    missingVars.forEach(varName => console.error(`   ${varName}`));
} else {
    console.log('✅ Variables de Cloudinary configuradas correctamente');
}

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage de Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'efresco', // Carpeta en Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ]
    }
});

// Configuración de multer con Cloudinary
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Middleware para subir imagen única - CORREGIDO: campo 'image' en lugar de 'imagen'
const uploadSingleToCloudinary = upload.single('image');

// Función helper para manejo de errores mejorado
const handleCloudinaryUpload = (req, res, next) => {
    console.log('🔍 DEBUG - Iniciando upload a Cloudinary');
    console.log('🔍 DEBUG - Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
        api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
    });
    
    uploadSingleToCloudinary(req, res, (err) => {
        if (err) {
            console.error('❌ Error subiendo a Cloudinary:', err);
            console.error('❌ Tipo de error:', err.name);
            console.error('❌ Código de error:', err.code);
            return res.status(400).json({
                error: 'Error al subir imagen a Cloudinary',
                details: err.message,
                type: err.name
            });
        }
        
        console.log('✅ Upload a Cloudinary exitoso');
        console.log('🔍 DEBUG - req.file después de Cloudinary:', req.file);
        next();
    });
};

module.exports = {
    cloudinary,
    uploadToCloudinary: uploadSingleToCloudinary,
    handleCloudinaryUpload
};