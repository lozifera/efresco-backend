const { Comentario, Usuario, Producto, AnuncioVenta } = require('../models');

/**
 * @desc    Crear nuevo comentario
 * @route   POST /api/comentarios
 * @access  Private
 */
const crearComentario = async (req, res) => {
    try {
        const { id_usuario, id_producto, id_anuncio_venta, comentario } = req.body;

        // Verificar que al menos uno de los IDs (producto o anuncio) esté presente
        if (!id_producto && !id_anuncio_venta) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar un producto o anuncio para comentar'
            });
        }

        // Verificar que el producto o anuncio existe
        if (id_producto) {
            const producto = await Producto.findByPk(id_producto);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
        }

        if (id_anuncio_venta) {
            const anuncio = await AnuncioVenta.findByPk(id_anuncio_venta);
            if (!anuncio) {
                return res.status(404).json({
                    success: false,
                    message: 'Anuncio no encontrado'
                });
            }
        }

        const nuevoComentario = await Comentario.create({
            id_usuario,
            id_producto,
            id_anuncio_venta,
            comentario,
            fecha_comentario: new Date()
        });

        const comentarioCompleto = await Comentario.findByPk(nuevoComentario.id_comentario, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Comentario creado exitosamente',
            data: comentarioCompleto
        });

    } catch (error) {
        console.error('Error al crear comentario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener comentarios por producto
 * @route   GET /api/comentarios/producto/:productId
 * @access  Public
 */
const obtenerComentariosPorProducto = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comentarios } = await Comentario.findAndCountAll({
            where: { id_producto: productId },
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_comentario', 'DESC']]
        });

        res.json({
            success: true,
            data: comentarios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener comentarios del producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener comentarios por anuncio
 * @route   GET /api/comentarios/anuncio/:anuncioId
 * @access  Public
 */
const obtenerComentariosPorAnuncio = async (req, res) => {
    try {
        const { anuncioId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comentarios } = await Comentario.findAndCountAll({
            where: { id_anuncio_venta: anuncioId },
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_comentario', 'DESC']]
        });

        res.json({
            success: true,
            data: comentarios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener comentarios del anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener comentarios de un usuario
 * @route   GET /api/comentarios/usuario/:userId
 * @access  Private
 */
const obtenerComentariosPorUsuario = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comentarios } = await Comentario.findAndCountAll({
            where: { id_usuario: userId },
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'imagen_url']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_comentario', 'DESC']]
        });

        res.json({
            success: true,
            data: comentarios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener comentarios del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener todos los comentarios
 * @route   GET /api/comentarios
 * @access  Private (Admin)
 */
const obtenerTodosLosComentarios = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comentarios } = await Comentario.findAndCountAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre', 'email']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_comentario', 'DESC']]
        });

        res.json({
            success: true,
            data: comentarios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener todos los comentarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar comentario
 * @route   PUT /api/comentarios/:id
 * @access  Private
 */
const actualizarComentario = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentario } = req.body;
        const userId = req.usuario.id_usuario;

        const comentarioExistente = await Comentario.findByPk(id);
        
        if (!comentarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Verificar que el usuario es el propietario del comentario
        if (comentarioExistente.id_usuario !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para editar este comentario'
            });
        }

        await comentarioExistente.update({ comentario });

        const comentarioActualizado = await Comentario.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Comentario actualizado exitosamente',
            data: comentarioActualizado
        });

    } catch (error) {
        console.error('Error al actualizar comentario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar comentario
 * @route   DELETE /api/comentarios/:id
 * @access  Private
 */
const eliminarComentario = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.usuario.id_usuario;
        const userRole = req.usuario.roles ? req.usuario.roles[0]?.nombre : null;

        const comentario = await Comentario.findByPk(id);
        
        if (!comentario) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Verificar permisos: propietario del comentario o administrador
        if (comentario.id_usuario !== userId && userRole !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este comentario'
            });
        }

        await comentario.destroy();

        res.json({
            success: true,
            message: 'Comentario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener estadísticas de comentarios
 * @route   GET /api/comentarios/estadisticas
 * @access  Private (Admin)
 */
const obtenerEstadisticasComentarios = async (req, res) => {
    try {
        const totalComentarios = await Comentario.count();
        
        const comentariosPorProducto = await Comentario.count({
            where: { id_producto: { [require('sequelize').Op.ne]: null } }
        });
        
        const comentariosPorAnuncio = await Comentario.count({
            where: { id_anuncio_venta: { [require('sequelize').Op.ne]: null } }
        });

        // Comentarios del último mes
        const haceMes = new Date();
        haceMes.setMonth(haceMes.getMonth() - 1);
        
        const comentariosRecientes = await Comentario.count({
            where: {
                fecha_comentario: {
                    [require('sequelize').Op.gte]: haceMes
                }
            }
        });

        res.json({
            success: true,
            data: {
                totalComentarios,
                comentariosPorProducto,
                comentariosPorAnuncio,
                comentariosUltimoMes: comentariosRecientes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de comentarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearComentario,
    obtenerComentariosPorProducto,
    obtenerComentariosPorAnuncio,
    obtenerComentariosPorUsuario,
    obtenerTodosLosComentarios,
    actualizarComentario,
    eliminarComentario,
    obtenerEstadisticasComentarios
};