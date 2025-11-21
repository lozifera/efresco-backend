const { Favoritos, Usuario, Producto, AnuncioVenta } = require('../models');

/**
 * @desc    Agregar producto/anuncio a favoritos
 * @route   POST /api/favoritos
 * @access  Private
 */
const agregarFavorito = async (req, res) => {
    try {
        const { id_producto, id_anuncio_venta } = req.body;
        const id_usuario = req.usuario.id_usuario;

        // Verificar que se proporcione al menos un ID
        if (!id_producto && !id_anuncio_venta) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar un producto o anuncio para agregar a favoritos'
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

        // Verificar si ya está en favoritos
        const favoritoExistente = await Favoritos.findOne({
            where: {
                id_usuario,
                ...(id_producto && { id_producto }),
                ...(id_anuncio_venta && { id_anuncio_venta })
            }
        });

        if (favoritoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Este elemento ya está en favoritos'
            });
        }

        const nuevoFavorito = await Favoritos.create({
            id_usuario,
            id_producto,
            id_anuncio_venta,
            fecha_agregado: new Date()
        });

        const favoritoCompleto = await Favoritos.findByPk(nuevoFavorito.id_favorito, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'descripcion', 'imagen_url', 'precio_referencia']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo', 'precio', 'cantidad_disponible'],
                    include: [
                        {
                            model: Producto,
                            attributes: ['nombre', 'imagen_url']
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Agregado a favoritos exitosamente',
            data: favoritoCompleto
        });

    } catch (error) {
        console.error('Error al agregar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener favoritos del usuario
 * @route   GET /api/favoritos
 * @access  Private
 */
const obtenerFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { page = 1, limit = 10, tipo } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = { id_usuario };
        
        // Filtrar por tipo si se especifica
        if (tipo === 'productos') {
            whereCondition.id_producto = { [require('sequelize').Op.ne]: null };
        } else if (tipo === 'anuncios') {
            whereCondition.id_anuncio_venta = { [require('sequelize').Op.ne]: null };
        }

        const { count, rows: favoritos } = await Favoritos.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'descripcion', 'imagen_url', 'precio_referencia']
                },
                {
                    model: AnuncioVenta,
                    attributes: ['id_anuncio_venta', 'titulo', 'precio', 'cantidad_disponible', 'ubicacion'],
                    include: [
                        {
                            model: Producto,
                            attributes: ['nombre', 'imagen_url']
                        },
                        {
                            model: Usuario,
                            as: 'vendedor',
                            attributes: ['id_usuario', 'nombre']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_agregado', 'DESC']]
        });

        res.json({
            success: true,
            data: favoritos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Verificar si un elemento está en favoritos
 * @route   GET /api/favoritos/verificar
 * @access  Private
 */
const verificarFavorito = async (req, res) => {
    try {
        const { id_producto, id_anuncio_venta } = req.query;
        const id_usuario = req.usuario.id_usuario;

        if (!id_producto && !id_anuncio_venta) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar un producto o anuncio para verificar'
            });
        }

        const favorito = await Favoritos.findOne({
            where: {
                id_usuario,
                ...(id_producto && { id_producto }),
                ...(id_anuncio_venta && { id_anuncio_venta })
            }
        });

        res.json({
            success: true,
            data: {
                esFavorito: !!favorito,
                id_favorito: favorito?.id_favorito || null
            }
        });

    } catch (error) {
        console.error('Error al verificar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener productos más agregados a favoritos
 * @route   GET /api/favoritos/populares
 * @access  Public
 */
const obtenerFavoritosPopulares = async (req, res) => {
    try {
        const { tipo = 'todos', limit = 10 } = req.query;

        let whereCondition = {};
        if (tipo === 'productos') {
            whereCondition.id_producto = { [require('sequelize').Op.ne]: null };
        } else if (tipo === 'anuncios') {
            whereCondition.id_anuncio_venta = { [require('sequelize').Op.ne]: null };
        }

        // Productos más populares en favoritos
        if (tipo === 'productos' || tipo === 'todos') {
            const productosPopulares = await Favoritos.findAll({
                where: { id_producto: { [require('sequelize').Op.ne]: null } },
                attributes: [
                    'id_producto',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id_producto')), 'total_favoritos']
                ],
                include: [
                    {
                        model: Producto,
                        attributes: ['id_producto', 'nombre', 'descripcion', 'imagen_url', 'precio_referencia']
                    }
                ],
                group: ['id_producto', 'Producto.id_producto'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_producto')), 'DESC']],
                limit: parseInt(limit)
            });

            if (tipo === 'productos') {
                return res.json({
                    success: true,
                    data: productosPopulares
                });
            }
        }

        // Anuncios más populares en favoritos
        if (tipo === 'anuncios' || tipo === 'todos') {
            const anunciosPopulares = await Favoritos.findAll({
                where: { id_anuncio_venta: { [require('sequelize').Op.ne]: null } },
                attributes: [
                    'id_anuncio_venta',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id_anuncio_venta')), 'total_favoritos']
                ],
                include: [
                    {
                        model: AnuncioVenta,
                        attributes: ['id_anuncio_venta', 'titulo', 'precio', 'ubicacion'],
                        include: [
                            {
                                model: Producto,
                                attributes: ['nombre', 'imagen_url']
                            }
                        ]
                    }
                ],
                group: ['id_anuncio_venta', 'AnuncioVenta.id_anuncio_venta', 'AnuncioVenta.Producto.id_producto'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_anuncio_venta')), 'DESC']],
                limit: parseInt(limit)
            });

            if (tipo === 'anuncios') {
                return res.json({
                    success: true,
                    data: anunciosPopulares
                });
            }
        }

        // Si es 'todos', devolver ambos
        const [productosPopulares, anunciosPopulares] = await Promise.all([
            Favoritos.findAll({
                where: { id_producto: { [require('sequelize').Op.ne]: null } },
                attributes: [
                    'id_producto',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id_producto')), 'total_favoritos']
                ],
                include: [
                    {
                        model: Producto,
                        attributes: ['id_producto', 'nombre', 'imagen_url', 'precio_referencia']
                    }
                ],
                group: ['id_producto', 'Producto.id_producto'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_producto')), 'DESC']],
                limit: parseInt(limit / 2)
            }),
            Favoritos.findAll({
                where: { id_anuncio_venta: { [require('sequelize').Op.ne]: null } },
                attributes: [
                    'id_anuncio_venta',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id_anuncio_venta')), 'total_favoritos']
                ],
                include: [
                    {
                        model: AnuncioVenta,
                        attributes: ['id_anuncio_venta', 'titulo', 'precio'],
                        include: [
                            {
                                model: Producto,
                                attributes: ['nombre', 'imagen_url']
                            }
                        ]
                    }
                ],
                group: ['id_anuncio_venta', 'AnuncioVenta.id_anuncio_venta', 'AnuncioVenta.Producto.id_producto'],
                order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_anuncio_venta')), 'DESC']],
                limit: parseInt(limit / 2)
            })
        ]);

        res.json({
            success: true,
            data: {
                productos: productosPopulares,
                anuncios: anunciosPopulares
            }
        });

    } catch (error) {
        console.error('Error al obtener favoritos populares:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar de favoritos
 * @route   DELETE /api/favoritos/:id
 * @access  Private
 */
const eliminarFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const favorito = await Favoritos.findByPk(id);
        
        if (!favorito) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        // Verificar que el favorito pertenece al usuario
        if (favorito.id_usuario !== id_usuario) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este favorito'
            });
        }

        await favorito.destroy();

        res.json({
            success: true,
            message: 'Eliminado de favoritos exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar de favoritos por producto/anuncio
 * @route   DELETE /api/favoritos/elemento
 * @access  Private
 */
const eliminarFavoritoPorElemento = async (req, res) => {
    try {
        const { id_producto, id_anuncio_venta } = req.query;
        const id_usuario = req.usuario.id_usuario;

        if (!id_producto && !id_anuncio_venta) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar un producto o anuncio para eliminar de favoritos'
            });
        }

        const favorito = await Favoritos.findOne({
            where: {
                id_usuario,
                ...(id_producto && { id_producto }),
                ...(id_anuncio_venta && { id_anuncio_venta })
            }
        });

        if (!favorito) {
            return res.status(404).json({
                success: false,
                message: 'Este elemento no está en favoritos'
            });
        }

        await favorito.destroy();

        res.json({
            success: true,
            message: 'Eliminado de favoritos exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar favorito por elemento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener estadísticas de favoritos del usuario
 * @route   GET /api/favoritos/estadisticas
 * @access  Private
 */
const obtenerEstadisticasFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const totalFavoritos = await Favoritos.count({ where: { id_usuario } });
        
        const favoritosProductos = await Favoritos.count({ 
            where: { 
                id_usuario, 
                id_producto: { [require('sequelize').Op.ne]: null } 
            } 
        });
        
        const favoritosAnuncios = await Favoritos.count({ 
            where: { 
                id_usuario, 
                id_anuncio_venta: { [require('sequelize').Op.ne]: null } 
            } 
        });

        // Favoritos recientes (último mes)
        const haceMes = new Date();
        haceMes.setMonth(haceMes.getMonth() - 1);
        
        const favoritosRecientes = await Favoritos.count({
            where: {
                id_usuario,
                fecha_agregado: {
                    [require('sequelize').Op.gte]: haceMes
                }
            }
        });

        res.json({
            success: true,
            data: {
                totalFavoritos,
                favoritosProductos,
                favoritosAnuncios,
                favoritosUltimoMes: favoritosRecientes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de favoritos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    agregarFavorito,
    obtenerFavoritos,
    verificarFavorito,
    obtenerFavoritosPopulares,
    eliminarFavorito,
    eliminarFavoritoPorElemento,
    obtenerEstadisticasFavoritos
};