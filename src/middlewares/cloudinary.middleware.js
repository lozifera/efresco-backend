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

// Middleware para subir imagen única - FLEXIBLE: acepta múltiples nombres de campo
const uploadSingleToCloudinary = upload.single('image');

// Middleware flexible que acepta cualquier campo de imagen
const handleFlexibleCloudinaryUpload = (req, res, next) => {
    console.log('🔍 DEBUG - Upload flexible iniciado');
    console.log('🔍 DEBUG - Content-Type:', req.get('Content-Type'));
    console.log('🔍 DEBUG - Body keys:', Object.keys(req.body || {}));
    
    // Usar upload.any() para aceptar cualquier campo
    const uploadAny = upload.any();
    
    uploadAny(req, res, (err) => {
        if (err) {
            console.error('❌ Error en upload flexible:', err);
            return res.status(400).json({
                error: 'Error al subir imagen',
                details: err.message,
                type: err.name
            });
        }
        
        // Buscar el primer archivo subido
        if (req.files && req.files.length > 0) {
            req.file = req.files[0]; // Asignar el primer archivo como req.file
            console.log('✅ Archivo encontrado:', req.file.fieldname);
            console.log('🔍 DEBUG - req.file:', req.file);
            return next();
        }
        
        console.log('❌ No se encontró archivo en la petición');
        return res.status(400).json({
            error: 'No se encontró archivo para subir',
            hint: 'Asegúrate de enviar un archivo en el FormData'
        });
    });
};

// Función específica para productos (campo 'imagen')
const uploadImagenProducto = upload.single('imagen');

const handleProductImageUpload = (req, res, next) => {
    console.log('🔍 DEBUG - Upload imagen producto');
    
    uploadImagenProducto(req, res, (err) => {
        if (err) {
            console.error('❌ Error subiendo imagen producto:', err);
            return res.status(400).json({
                error: 'Error al subir imagen del producto',
                details: err.message
            });
        }
        
        console.log('✅ Upload imagen producto exitoso');
        next();
    });
};

module.exports = {
    cloudinary,
    uploadToCloudinary: uploadSingleToCloudinary,
    handleCloudinaryUpload: handleFlexibleCloudinaryUpload,
    handleProductImageUpload
};