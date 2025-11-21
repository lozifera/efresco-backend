const { Reputacion, Usuario, Pedido } = require('../models');

/**
 * @desc    Crear nueva reputación/calificación
 * @route   POST /api/reputacion
 * @access  Private
 */
const crearReputacion = async (req, res) => {
    try {
        const { id_usuario_calificado, id_usuario_calificador, id_pedido, calificacion, comentario } = req.body;

        // Verificar que la calificación esté en el rango correcto
        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({
                success: false,
                message: 'La calificación debe estar entre 1 y 5'
            });
        }

        // Verificar que el pedido existe y está completado
        if (id_pedido) {
            const pedido = await Pedido.findByPk(id_pedido);
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            if (pedido.estado !== 'entregado' && pedido.estado !== 'completado') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se puede calificar pedidos entregados o completados'
                });
            }
        }

        // Verificar que no haya calificado antes en el mismo pedido
        if (id_pedido) {
            const reputacionExistente = await Reputacion.findOne({
                where: {
                    id_usuario_calificado,
                    id_usuario_calificador,
                    id_pedido
                }
            });

            if (reputacionExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya has calificado este pedido'
                });
            }
        }

        const nuevaReputacion = await Reputacion.create({
            id_usuario_calificado,
            id_usuario_calificador,
            id_pedido,
            calificacion,
            comentario,
            fecha_calificacion: new Date()
        });

        const reputacionCompleta = await Reputacion.findByPk(nuevaReputacion.id_reputacion, {
            include: [
                {
                    model: Usuario,
                    as: 'calificado',
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Usuario,
                    as: 'calificador',
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Pedido,
                    attributes: ['id_pedido', 'precio_total']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Calificación creada exitosamente',
            data: reputacionCompleta
        });

    } catch (error) {
        console.error('Error al crear reputación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener reputación de un usuario
 * @route   GET /api/reputacion/usuario/:userId
 * @access  Public
 */
const obtenerReputacionUsuario = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Obtener calificaciones recibidas por el usuario
        const { count, rows: calificaciones } = await Reputacion.findAndCountAll({
            where: { id_usuario_calificado: userId },
            include: [
                {
                    model: Usuario,
                    as: 'calificador',
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Pedido,
                    attributes: ['id_pedido', 'precio_total', 'fecha_pedido']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_calificacion', 'DESC']]
        });

        // Calcular estadísticas de reputación
        const estadisticas = await Reputacion.findOne({
            where: { id_usuario_calificado: userId },
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('calificacion')), 'promedio'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 'total_calificaciones']
            ],
            raw: true
        });

        // Distribución de calificaciones
        const distribucion = await Reputacion.findAll({
            where: { id_usuario_calificado: userId },
            attributes: [
                'calificacion',
                [require('sequelize').fn('COUNT', require('sequelize').col('calificacion')), 'cantidad']
            ],
            group: ['calificacion'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                calificaciones,
                estadisticas: {
                    promedio: estadisticas?.promedio ? parseFloat(estadisticas.promedio).toFixed(1) : 0,
                    totalCalificaciones: estadisticas?.total_calificaciones || 0,
                    distribucion
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener reputación del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener calificaciones dadas por un usuario
 * @route   GET /api/reputacion/calificadas/:userId
 * @access  Private
 */
const obtenerCalificacionesDadas = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: calificaciones } = await Reputacion.findAndCountAll({
            where: { id_usuario_calificador: userId },
            include: [
                {
                    model: Usuario,
                    as: 'calificado',
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Pedido,
                    attributes: ['id_pedido', 'precio_total', 'fecha_pedido']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_calificacion', 'DESC']]
        });

        res.json({
            success: true,
            data: calificaciones,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener calificaciones dadas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener ranking de usuarios mejor calificados
 * @route   GET /api/reputacion/ranking
 * @access  Public
 */
const obtenerRankingUsuarios = async (req, res) => {
    try {
        const { limit = 10, tipo = 'todos' } = req.query;

        const whereCondition = {};
        
        // Filtrar por tipo de usuario si se especifica
        if (tipo === 'vendedores') {
            // Aquí podrías agregar lógica para identificar vendedores
            // Por ejemplo, usuarios que tienen anuncios de venta
        }

        const ranking = await Reputacion.findAll({
            where: whereCondition,
            attributes: [
                'id_usuario_calificado',
                [require('sequelize').fn('AVG', require('sequelize').col('calificacion')), 'promedio'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 'total_calificaciones']
            ],
            include: [
                {
                    model: Usuario,
                    as: 'calificado',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                }
            ],
            group: ['id_usuario_calificado', 'calificado.id_usuario'],
            having: require('sequelize').where(
                require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 
                '>=', 
                3 // Mínimo 3 calificaciones para aparecer en el ranking
            ),
            order: [
                [require('sequelize').fn('AVG', require('sequelize').col('calificacion')), 'DESC'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: ranking.map((item, index) => ({
                posicion: index + 1,
                usuario: item.calificado,
                promedio: parseFloat(item.dataValues.promedio).toFixed(1),
                totalCalificaciones: item.dataValues.total_calificaciones
            }))
        });

    } catch (error) {
        console.error('Error al obtener ranking de usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar calificación
 * @route   PUT /api/reputacion/:id
 * @access  Private
 */
const actualizarReputacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario } = req.body;
        const userId = req.usuario.id_usuario;

        const reputacion = await Reputacion.findByPk(id);
        
        if (!reputacion) {
            return res.status(404).json({
                success: false,
                message: 'Calificación no encontrada'
            });
        }

        // Verificar que el usuario es quien hizo la calificación
        if (reputacion.id_usuario_calificador !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para editar esta calificación'
            });
        }

        // Verificar que la calificación esté en el rango correcto
        if (calificacion && (calificacion < 1 || calificacion > 5)) {
            return res.status(400).json({
                success: false,
                message: 'La calificación debe estar entre 1 y 5'
            });
        }

        const datosActualizacion = {};
        if (calificacion) datosActualizacion.calificacion = calificacion;
        if (comentario !== undefined) datosActualizacion.comentario = comentario;

        await reputacion.update(datosActualizacion);

        const reputacionActualizada = await Reputacion.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'calificado',
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Usuario,
                    as: 'calificador',
                    attributes: ['id_usuario', 'nombre']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Calificación actualizada exitosamente',
            data: reputacionActualizada
        });

    } catch (error) {
        console.error('Error al actualizar reputación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar calificación
 * @route   DELETE /api/reputacion/:id
 * @access  Private
 */
const eliminarReputacion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.usuario.id_usuario;
        const userRole = req.usuario.roles ? req.usuario.roles[0]?.nombre : null;

        const reputacion = await Reputacion.findByPk(id);
        
        if (!reputacion) {
            return res.status(404).json({
                success: false,
                message: 'Calificación no encontrada'
            });
        }

        // Verificar permisos: propietario de la calificación o administrador
        if (reputacion.id_usuario_calificador !== userId && userRole !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta calificación'
            });
        }

        await reputacion.destroy();

        res.json({
            success: true,
            message: 'Calificación eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar reputación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener estadísticas generales de reputación
 * @route   GET /api/reputacion/estadisticas
 * @access  Private (Admin)
 */
const obtenerEstadisticasGenerales = async (req, res) => {
    try {
        const totalCalificaciones = await Reputacion.count();
        
        const promedioGeneral = await Reputacion.findOne({
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('calificacion')), 'promedio']
            ],
            raw: true
        });

        // Distribución de calificaciones
        const distribucionGeneral = await Reputacion.findAll({
            attributes: [
                'calificacion',
                [require('sequelize').fn('COUNT', require('sequelize').col('calificacion')), 'cantidad']
            ],
            group: ['calificacion'],
            order: ['calificacion'],
            raw: true
        });

        // Usuarios más activos calificando
        const usuariosActivos = await Reputacion.findAll({
            attributes: [
                'id_usuario_calificador',
                [require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 'calificaciones_dadas']
            ],
            include: [
                {
                    model: Usuario,
                    as: 'calificador',
                    attributes: ['nombre']
                }
            ],
            group: ['id_usuario_calificador', 'calificador.id_usuario'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_reputacion')), 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                totalCalificaciones,
                promedioGeneral: promedioGeneral?.promedio ? parseFloat(promedioGeneral.promedio).toFixed(1) : 0,
                distribucionGeneral,
                usuariosActivos
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas generales:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearReputacion,
    obtenerReputacionUsuario,
    obtenerCalificacionesDadas,
    obtenerRankingUsuarios,
    actualizarReputacion,
    eliminarReputacion,
    obtenerEstadisticasGenerales
};