const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

// Middleware para subir imagen única
const uploadSingleToCloudinary = upload.single('imagen');

// Función helper para manejo de errores
const handleCloudinaryUpload = (req, res, next) => {
    uploadSingleToCloudinary(req, res, (err) => {
        if (err) {
            console.error('❌ Error subiendo a Cloudinary:', err);
            return res.status(400).json({
                error: 'Error al subir imagen',
                details: err.message
            });
        }
        next();
    });
};

module.exports = {
    cloudinary,
    uploadToCloudinary: uploadSingleToCloudinary,
    handleCloudinaryUpload
};