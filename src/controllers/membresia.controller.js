const { Membresia, UsuarioMembresia, Usuario } = require('../models');

/**
 * @desc    Crear nueva membresía
 * @route   POST /api/membresias
 * @access  Private (Admin)
 */
const crearMembresia = async (req, res) => {
    try {
        const { nombre, descripcion, precio, duracion_dias, caracteristicas, activo = true } = req.body;

        const nuevaMembresia = await Membresia.create({
            nombre,
            descripcion,
            precio,
            duracion_dias,
            caracteristicas: caracteristicas || {},
            activo
        });

        res.status(201).json({
            success: true,
            message: 'Membresía creada exitosamente',
            data: nuevaMembresia
        });

    } catch (error) {
        console.error('Error al crear membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener todas las membresías
 * @route   GET /api/membresias
 * @access  Public
 */
const obtenerMembresias = async (req, res) => {
    try {
        const { activo } = req.query;

        const whereCondition = {};
        if (activo !== undefined) {
            whereCondition.activo = activo === 'true';
        }

        const membresias = await Membresia.findAll({
            where: whereCondition,
            order: [['precio', 'ASC']]
        });

        res.json({
            success: true,
            data: membresias
        });

    } catch (error) {
        console.error('Error al obtener membresías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener membresía por ID
 * @route   GET /api/membresias/:id
 * @access  Public
 */
const obtenerMembresiaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const membresia = await Membresia.findByPk(id);

        if (!membresia) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }

        res.json({
            success: true,
            data: membresia
        });

    } catch (error) {
        console.error('Error al obtener membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar membresía
 * @route   PUT /api/membresias/:id
 * @access  Private (Admin)
 */
const actualizarMembresia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, duracion_dias, caracteristicas, activo } = req.body;

        const membresia = await Membresia.findByPk(id);
        
        if (!membresia) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }

        const datosActualizacion = {};
        if (nombre) datosActualizacion.nombre = nombre;
        if (descripcion) datosActualizacion.descripcion = descripcion;
        if (precio !== undefined) datosActualizacion.precio = precio;
        if (duracion_dias) datosActualizacion.duracion_dias = duracion_dias;
        if (caracteristicas) datosActualizacion.caracteristicas = caracteristicas;
        if (activo !== undefined) datosActualizacion.activo = activo;

        await membresia.update(datosActualizacion);

        res.json({
            success: true,
            message: 'Membresía actualizada exitosamente',
            data: membresia
        });

    } catch (error) {
        console.error('Error al actualizar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar membresía
 * @route   DELETE /api/membresias/:id
 * @access  Private (Admin)
 */
const eliminarMembresia = async (req, res) => {
    try {
        const { id } = req.params;

        const membresia = await Membresia.findByPk(id);
        
        if (!membresia) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }

        // Verificar si hay usuarios activos con esta membresía
        const usuariosActivos = await UsuarioMembresia.count({
            where: {
                id_membresia: id,
                activo: true
            }
        });

        if (usuariosActivos > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una membresía con usuarios activos'
            });
        }

        await membresia.destroy();

        res.json({
            success: true,
            message: 'Membresía eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ==================== USUARIO MEMBRESÍAS ====================

/**
 * @desc    Asignar membresía a usuario
 * @route   POST /api/membresias/asignar
 * @access  Private
 */
const asignarMembresia = async (req, res) => {
    try {
        const { id_usuario, id_membresia } = req.body;

        // Verificar que la membresía existe y está activa
        const membresia = await Membresia.findByPk(id_membresia);
        if (!membresia) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }

        if (!membresia.activo) {
            return res.status(400).json({
                success: false,
                message: 'La membresía no está disponible'
            });
        }

        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Desactivar membresías anteriores del usuario
        await UsuarioMembresia.update(
            { activo: false },
            { where: { id_usuario, activo: true } }
        );

        // Calcular fecha de expiración
        const fechaInicio = new Date();
        const fechaExpiracion = new Date(fechaInicio);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + membresia.duracion_dias);

        // Crear nueva asignación de membresía
        const usuarioMembresia = await UsuarioMembresia.create({
            id_usuario,
            id_membresia,
            fecha_inicio: fechaInicio,
            fecha_expiracion: fechaExpiracion,
            activo: true
        });

        const asignacionCompleta = await UsuarioMembresia.findByPk(usuarioMembresia.id_usuario_membresia, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre', 'email']
                },
                {
                    model: Membresia,
                    attributes: ['id_membresia', 'nombre', 'descripcion', 'precio']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Membresía asignada exitosamente',
            data: asignacionCompleta
        });

    } catch (error) {
        console.error('Error al asignar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener membresía activa del usuario
 * @route   GET /api/membresias/mi-membresia
 * @access  Private
 */
const obtenerMembresiaUsuario = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const usuarioMembresia = await UsuarioMembresia.findOne({
            where: {
                id_usuario,
                activo: true
            },
            include: [
                {
                    model: Membresia,
                    attributes: ['id_membresia', 'nombre', 'descripcion', 'caracteristicas']
                }
            ]
        });

        if (!usuarioMembresia) {
            return res.json({
                success: true,
                message: 'Usuario sin membresía activa',
                data: null
            });
        }

        // Verificar si la membresía ha expirado
        const ahora = new Date();
        if (usuarioMembresia.fecha_expiracion < ahora) {
            await usuarioMembresia.update({ activo: false });
            return res.json({
                success: true,
                message: 'Membresía expirada',
                data: null
            });
        }

        // Calcular días restantes
        const diasRestantes = Math.ceil((usuarioMembresia.fecha_expiracion - ahora) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                ...usuarioMembresia.toJSON(),
                diasRestantes
            }
        });

    } catch (error) {
        console.error('Error al obtener membresía del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener historial de membresías del usuario
 * @route   GET /api/membresias/historial
 * @access  Private
 */
const obtenerHistorialMembresias = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: historial } = await UsuarioMembresia.findAndCountAll({
            where: { id_usuario },
            include: [
                {
                    model: Membresia,
                    attributes: ['id_membresia', 'nombre', 'descripcion', 'precio']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_inicio', 'DESC']]
        });

        res.json({
            success: true,
            data: historial,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener historial de membresías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Cancelar membresía activa
 * @route   PUT /api/membresias/cancelar
 * @access  Private
 */
const cancelarMembresia = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const usuarioMembresia = await UsuarioMembresia.findOne({
            where: {
                id_usuario,
                activo: true
            }
        });

        if (!usuarioMembresia) {
            return res.status(404).json({
                success: false,
                message: 'No tienes una membresía activa'
            });
        }

        await usuarioMembresia.update({ activo: false });

        res.json({
            success: true,
            message: 'Membresía cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener estadísticas de membresías (Admin)
 * @route   GET /api/membresias/estadisticas
 * @access  Private (Admin)
 */
const obtenerEstadisticasMembresias = async (req, res) => {
    try {
        const totalMembresias = await Membresia.count();
        const membresiasActivas = await Membresia.count({ where: { activo: true } });

        const usuariosConMembresia = await UsuarioMembresia.count({
            where: { activo: true }
        });

        // Membresías más populares
        const membresiasPopulares = await UsuarioMembresia.findAll({
            attributes: [
                'id_membresia',
                [require('sequelize').fn('COUNT', require('sequelize').col('id_membresia')), 'total_usuarios']
            ],
            include: [
                {
                    model: Membresia,
                    attributes: ['nombre', 'precio']
                }
            ],
            where: { activo: true },
            group: ['id_membresia', 'Membresia.id_membresia'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_membresia')), 'DESC']],
            limit: 5
        });

        // Ingresos estimados por membresías activas
        const ingresos = await UsuarioMembresia.sum('Membresia.precio', {
            include: [
                {
                    model: Membresia,
                    attributes: []
                }
            ],
            where: { activo: true }
        });

        res.json({
            success: true,
            data: {
                totalMembresias,
                membresiasActivas,
                usuariosConMembresia,
                membresiasPopulares,
                ingresosEstimados: ingresos || 0
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de membresías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Renovar membresía expirada
 * @route   PUT /api/membresias/renovar/:id
 * @access  Private
 */
const renovarMembresia = async (req, res) => {
    try {
        const { id } = req.params; // ID de la UsuarioMembresia
        const id_usuario = req.usuario.id_usuario;

        const usuarioMembresia = await UsuarioMembresia.findOne({
            where: {
                id_usuario_membresia: id,
                id_usuario
            },
            include: [
                {
                    model: Membresia
                }
            ]
        });

        if (!usuarioMembresia) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }

        // Desactivar cualquier membresía activa actual
        await UsuarioMembresia.update(
            { activo: false },
            { where: { id_usuario, activo: true } }
        );

        // Calcular nuevas fechas
        const fechaInicio = new Date();
        const fechaExpiracion = new Date(fechaInicio);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + usuarioMembresia.Membresia.duracion_dias);

        // Actualizar la membresía
        await usuarioMembresia.update({
            fecha_inicio: fechaInicio,
            fecha_expiracion: fechaExpiracion,
            activo: true
        });

        res.json({
            success: true,
            message: 'Membresía renovada exitosamente',
            data: usuarioMembresia
        });

    } catch (error) {
        console.error('Error al renovar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    // Gestión de membresías
    crearMembresia,
    obtenerMembresias,
    obtenerMembresiaPorId,
    actualizarMembresia,
    eliminarMembresia,
    
    // Gestión usuario-membresías
    asignarMembresia,
    obtenerMembresiaUsuario,
    obtenerHistorialMembresias,
    cancelarMembresia,
    renovarMembresia,
    
    // Estadísticas
    obtenerEstadisticasMembresias
};