const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, UsuarioRol } = require('../models');
const emailService = require('../services/email.service');
const TokenUtils = require('../utils/token.utils');

/**
 * Registrar nuevo usuario
 */
const registrarUsuario = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            email, 
            password, 
            telefono, 
            direccion,
            ubicacion_lat,
            ubicacion_lng,
            roles = ['cliente'] // Por defecto asignar rol cliente
        } = req.body;

        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password_hash,
            telefono,
            direccion,
            ubicacion_lat,
            ubicacion_lng
        });

        // Asignar roles
        for (const nombreRol of roles) {
            const rol = await Rol.findOne({ where: { nombre: nombreRol } });
            if (rol) {
                await UsuarioRol.create({
                    id_usuario: nuevoUsuario.id_usuario,
                    id_rol: rol.id_rol
                });
            }
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id_usuario: nuevoUsuario.id_usuario, 
                email: nuevoUsuario.email 
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono,
                verificado: nuevoUsuario.verificado,
                fecha_registro: nuevoUsuario.fecha_registro
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al registrar usuario',
            details: error.message
        });
    }
};

/**
 * Iniciar sesión
 */
const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ 
            where: { email },
            include: [{
                model: Rol,
                through: { attributes: [] }
            }]
        });

        if (!usuario || !usuario.estado) {
            return res.status(401).json({
                error: 'Credenciales inválidas o cuenta desactivada'
            });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = jwt.sign(
            { 
                id_usuario: usuario.id_usuario, 
                email: usuario.email 
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                verificado: usuario.verificado,
                roles: usuario.Rols?.map(rol => rol.nombre) || []
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al iniciar sesión',
            details: error.message
        });
    }
};

/**
 * Obtener perfil de usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: Rol,
                through: { attributes: [] }
            }]
        });

        res.json({
            usuario: {
                ...usuario.toJSON(),
                roles: usuario.Rols?.map(rol => rol.nombre) || []
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener perfil',
            details: error.message
        });
    }
};

/**
 * Obtener datos de usuario por ID (público)
 */
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: { 
                exclude: ['password_hash', 'reset_password_token', 'reset_password_expires'] 
            },
            include: [{
                model: Rol,
                through: { attributes: [] }
            }]
        });

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                ubicacion_lat: usuario.ubicacion_lat,
                ubicacion_lng: usuario.ubicacion_lng,
                foto_perfil_url: usuario.foto_perfil_url,
                verificado: usuario.verificado,
                fecha_registro: usuario.fecha_registro,
                roles: usuario.Rols?.map(rol => rol.nombre) || []
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener usuario',
            details: error.message
        });
    }
};

/**
 * Actualizar perfil de usuario
 */
const actualizarPerfil = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            telefono, 
            direccion,
            ubicacion_lat,
            ubicacion_lng,
            documento_identidad,
            foto_perfil_url
        } = req.body;

        const usuario = await Usuario.findByPk(req.usuario.id_usuario);
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        await usuario.update({
            nombre: nombre || usuario.nombre,
            apellido: apellido || usuario.apellido,
            telefono: telefono || usuario.telefono,
            direccion: direccion || usuario.direccion,
            ubicacion_lat: ubicacion_lat || usuario.ubicacion_lat,
            ubicacion_lng: ubicacion_lng || usuario.ubicacion_lng,
            documento_identidad: documento_identidad || usuario.documento_identidad,
            foto_perfil_url: foto_perfil_url || usuario.foto_perfil_url
        });

        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                verificado: usuario.verificado
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar perfil',
            details: error.message
        });
    }
};

/**
 * Listar todos los usuarios (solo admin)
 */
const listarUsuarios = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Usuario.findAndCountAll({
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: Rol,
                through: { attributes: [] }
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_registro', 'DESC']]
        });

        res.json({
            usuarios: rows.map(usuario => ({
                ...usuario.toJSON(),
                roles: usuario.Rols?.map(rol => rol.nombre) || []
            })),
            paginacion: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al listar usuarios',
            details: error.message
        });
    }
};

/**
 * Solicitar recuperación de contraseña
 */
const solicitarRecuperacionPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ 
            where: { email },
            attributes: ['id_usuario', 'email', 'nombre', 'apellido', 'esta_activo']
        });

        // Por seguridad, siempre respondemos exitosamente aunque no exista el usuario
        // Esto evita ataques de enumeración de emails
        if (!usuario) {
            return res.status(200).json({
                mensaje: 'Si el email existe, se enviará un correo de recuperación'
            });
        }

        // Verificar que la cuenta esté activa
        if (!usuario.esta_activo) {
            return res.status(200).json({
                mensaje: 'Si el email existe, se enviará un correo de recuperación'
            });
        }

        // Generar token seguro
        const resetToken = TokenUtils.generarTokenRecuperacion();
        const hashedToken = TokenUtils.hashearToken(resetToken);
        const fechaExpiracion = TokenUtils.calcularFechaExpiracion(15); // 15 minutos

        // Guardar token en BD
        await usuario.update({
            reset_password_token: hashedToken,
            reset_password_expires: fechaExpiracion
        });

        // Enviar email
        try {
            await emailService.enviarEmailRecuperacion(
                email, 
                resetToken, 
                `${usuario.nombre} ${usuario.apellido}`.trim()
            );
            
            console.log(`📧 Email de recuperación enviado a: ${email}`);
        } catch (emailError) {
            console.error('❌ Error enviando email:', emailError);
            // Limpiar token si falla el envío
            await usuario.update({
                reset_password_token: null,
                reset_password_expires: null
            });
            
            return res.status(500).json({
                error: 'Error enviando email de recuperación'
            });
        }

        res.status(200).json({
            mensaje: 'Si el email existe, se enviará un correo de recuperación'
        });

    } catch (error) {
        console.error('❌ Error en recuperación:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

/**
 * Verificar token de recuperación
 */
const verificarTokenRecuperacion = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token requerido'
            });
        }

        // Buscar usuario con token válido y no expirado
        const usuario = await Usuario.findOne({
            where: {
                reset_password_token: { [require('sequelize').Op.ne]: null },
                reset_password_expires: { [require('sequelize').Op.gt]: new Date() }
            },
            attributes: ['id_usuario', 'reset_password_token', 'reset_password_expires']
        });

        if (!usuario) {
            return res.status(400).json({
                error: 'Token inválido o expirado'
            });
        }

        // Verificar token con timing-safe comparison
        const tokenValido = TokenUtils.verificarToken(token, usuario.reset_password_token);
        
        if (!tokenValido) {
            return res.status(400).json({
                error: 'Token inválido'
            });
        }

        // Token válido
        res.status(200).json({
            mensaje: 'Token válido',
            token_valido: true
        });

    } catch (error) {
        console.error('❌ Error verificando token:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

/**
 * Restablecer contraseña con token
 */
const restablecerPassword = async (req, res) => {
    try {
        const { token, nueva_password } = req.body;

        if (!token || !nueva_password) {
            return res.status(400).json({
                error: 'Token y nueva contraseña requeridos'
            });
        }

        // Validar contraseña
        if (nueva_password.length < 8) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Buscar usuario con token válido y no expirado
        const usuario = await Usuario.findOne({
            where: {
                reset_password_token: { [require('sequelize').Op.ne]: null },
                reset_password_expires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!usuario) {
            return res.status(400).json({
                error: 'Token inválido o expirado'
            });
        }

        // Verificar token
        const tokenValido = TokenUtils.verificarToken(token, usuario.reset_password_token);
        
        if (!tokenValido) {
            return res.status(400).json({
                error: 'Token inválido'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const nueva_password_hash = await bcrypt.hash(nueva_password, saltRounds);

        // Actualizar contraseña y limpiar token
        await usuario.update({
            password_hash: nueva_password_hash,
            reset_password_token: null,
            reset_password_expires: null
        });

        console.log(`🔐 Contraseña restablecida para usuario ID: ${usuario.id_usuario}`);

        res.status(200).json({
            mensaje: 'Contraseña restablecida exitosamente'
        });

    } catch (error) {
        console.error('❌ Error restableciendo contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

/**
 * Subir foto de perfil
 */
const subirFotoPerfil = async (req, res) => {
    try {
        console.log('🔍 DEBUG - Iniciando subida de foto');
        console.log('🔍 DEBUG - req.file:', req.file);
        console.log('🔍 DEBUG - Usuario ID:', req.usuario?.id_usuario);
        
        if (!req.file) {
            console.log('❌ No se encontró archivo en req.file');
            return res.status(400).json({
                error: 'No se ha subido ningún archivo'
            });
        }

        const usuario = await Usuario.findByPk(req.usuario.id_usuario);
        
        if (!usuario) {
            console.log('❌ Usuario no encontrado:', req.usuario.id_usuario);
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Con Cloudinary, req.file.path contiene la URL segura de la imagen
        const foto_perfil_url = req.file.path;
        console.log('🔍 DEBUG - URL de Cloudinary:', foto_perfil_url);

        // Actualizar URL de foto en la base de datos
        await usuario.update({
            foto_perfil_url: foto_perfil_url
        });

        console.log(`📷 Foto de perfil actualizada para usuario ${usuario.id_usuario}: ${foto_perfil_url}`);

        res.status(200).json({
            mensaje: 'Foto de perfil subida exitosamente',
            foto_perfil_url: foto_perfil_url,
            file_info: {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                cloudinary_id: req.file.public_id
            }
        });

    } catch (error) {
        console.error('❌ Error subiendo foto de perfil:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message,
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Eliminar foto de perfil
 */
const eliminarFotoPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id_usuario);
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Eliminar URL de foto en la base de datos
        await usuario.update({
            foto_perfil_url: null
        });

        console.log(`🗑️ Foto de perfil eliminada para usuario ${usuario.id_usuario}`);

        res.status(200).json({
            mensaje: 'Foto de perfil eliminada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error eliminando foto de perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfil,
    obtenerUsuarioPorId,
    actualizarPerfil,
    listarUsuarios,
    solicitarRecuperacionPassword,
    verificarTokenRecuperacion,
    restablecerPassword,
    subirFotoPerfil,
    eliminarFotoPerfil
};