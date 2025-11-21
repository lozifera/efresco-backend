const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Token de acceso requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Buscar el usuario en la base de datos
        const usuario = await Usuario.findByPk(decoded.id_usuario);
        
        if (!usuario || !usuario.estado) {
            return res.status(401).json({
                error: 'Token inválido o usuario desactivado'
            });
        }

        // Agregar información del usuario al request
        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido',
            details: error.message
        });
    }
};

/**
 * Middleware para verificar roles específicos
 */
const checkRole = (rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    error: 'Usuario no autenticado'
                });
            }

            // Obtener roles del usuario
            const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
                include: [{
                    model: require('../models').Rol,
                    through: { attributes: [] }
                }]
            });

            const rolesUsuario = usuario.Rols?.map(rol => rol.nombre) || [];
            
            const tienePermiso = rolesPermitidos.some(rol => rolesUsuario.includes(rol));
            
            if (!tienePermiso) {
                return res.status(403).json({
                    error: 'No tienes permisos para acceder a este recurso',
                    rolesRequeridos: rolesPermitidos,
                    rolesUsuario: rolesUsuario
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Error al verificar permisos',
                details: error.message
            });
        }
    };
};

/**
 * Middleware para verificar que el usuario es propietario del recurso
 */
const checkOwnership = (campoUsuario = 'id_usuario') => {
    return (req, res, next) => {
        try {
            const idUsuarioAutenticado = req.usuario?.id_usuario;
            const idUsuarioRecurso = req.params[campoUsuario] || req.body[campoUsuario];

            if (!idUsuarioAutenticado) {
                return res.status(401).json({
                    error: 'Usuario no autenticado'
                });
            }

            if (parseInt(idUsuarioAutenticado) !== parseInt(idUsuarioRecurso)) {
                return res.status(403).json({
                    error: 'No puedes acceder a recursos de otros usuarios'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Error al verificar propiedad del recurso',
                details: error.message
            });
        }
    };
};

module.exports = {
    verifyToken,
    checkRole,
    checkOwnership
};