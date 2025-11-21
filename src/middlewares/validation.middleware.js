const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Errores de validación',
            details: errors.array().map(error => ({
                campo: error.path,
                mensaje: error.msg,
                valorRecibido: error.value
            }))
        });
    }
    
    next();
};

/**
 * Middleware de rate limiting personalizado para prevenir spam de anuncios
 */
const checkAnuncioLimit = async (req, res, next) => {
    try {
        const { Usuario } = require('../models');
        const usuario = await Usuario.findByPk(req.usuario.id_usuario);
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const hoy = new Date().toDateString();
        const ultimaPublicacion = usuario.ultima_publicacion ? 
            new Date(usuario.ultima_publicacion).toDateString() : null;

        // Resetear contador si es un nuevo día
        if (ultimaPublicacion !== hoy) {
            await usuario.update({
                anuncios_publicados_hoy: 0,
                ultima_publicacion: new Date()
            });
        }

        // Verificar límite diario
        if (usuario.anuncios_publicados_hoy >= usuario.limite_anuncios_diarios) {
            return res.status(429).json({
                error: 'Límite diario de anuncios alcanzado',
                limite: usuario.limite_anuncios_diarios,
                publicados: usuario.anuncios_publicados_hoy,
                mensaje: 'Puedes publicar más anuncios mañana o mejorar tu membresía'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Error al verificar límite de anuncios',
            details: error.message
        });
    }
};

/**
 * Middleware para incrementar contador de anuncios después de crear uno
 */
const incrementAnuncioCounter = async (req, res, next) => {
    try {
        const { Usuario } = require('../models');
        await Usuario.increment('anuncios_publicados_hoy', {
            where: { id_usuario: req.usuario.id_usuario }
        });
        next();
    } catch (error) {
        console.error('Error al incrementar contador de anuncios:', error);
        next(); // No bloqueamos la respuesta por este error
    }
};

module.exports = {
    handleValidationErrors,
    checkAnuncioLimit,
    incrementAnuncioCounter
};