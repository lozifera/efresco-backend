const { AnuncioVenta, AnuncioCompra, Usuario, Producto } = require('../models');
const { Op } = require('sequelize');

/**
 * Crear anuncio de venta
 */
const crearAnuncioVenta = async (req, res) => {
    try {
        const {
            id_producto,
            cantidad,
            unidad,
            precio,
            descripcion,
            ubicacion,
            ubicacion_lat,
            ubicacion_lng
        } = req.body;

        const nuevoAnuncio = await AnuncioVenta.create({
            id_usuario: req.usuario.id_usuario,
            id_producto,
            cantidad,
            unidad,
            precio,
            descripcion,
            ubicacion,
            ubicacion_lat,
            ubicacion_lng
        });

        const anuncioCompleto = await AnuncioVenta.findByPk(nuevoAnuncio.id_anuncio, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre', 'apellido', 'telefono', 'verificado']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'unidad_medida', 'imagen_url']
                }
            ]
        });

        res.status(201).json({
            mensaje: 'Anuncio de venta creado exitosamente',
            anuncio: anuncioCompleto
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear anuncio de venta',
            details: error.message
        });
    }
};

/**
 * Crear anuncio de compra
 */
const crearAnuncioCompra = async (req, res) => {
    try {
        const {
            id_producto,
            cantidad,
            unidad,
            precio_ofertado,
            descripcion
        } = req.body;

        const nuevoAnuncio = await AnuncioCompra.create({
            id_usuario: req.usuario.id_usuario,
            id_producto,
            cantidad,
            unidad,
            precio_ofertado,
            descripcion
        });

        const anuncioCompleto = await AnuncioCompra.findByPk(nuevoAnuncio.id_anuncio, {
            include: [
                {
                    model: Usuario,
                    attributes: ['id_usuario', 'nombre', 'apellido', 'telefono', 'verificado']
                },
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'unidad_medida', 'imagen_url']
                }
            ]
        });

        res.status(201).json({
            mensaje: 'Anuncio de compra creado exitosamente',
            anuncio: anuncioCompleto
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear anuncio de compra',
            details: error.message
        });
    }
};

/**
 * Listar anuncios de venta
 */
const listarAnunciosVenta = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            producto_id, 
            ubicacion,
            precio_min,
            precio_max,
            cantidad_min,
            estado = 'activo'
        } = req.query;
        
        const offset = (page - 1) * limit;
        const whereClause = { estado };

        // Filtro por producto
        if (producto_id) {
            whereClause.id_producto = producto_id;
        }

        // Filtro por ubicación
        if (ubicacion) {
            whereClause.ubicacion = { [Op.iLike]: `%${ubicacion}%` };
        }

        // Filtro por rango de precio
        if (precio_min || precio_max) {
            whereClause.precio = {};
            if (precio_min) whereClause.precio[Op.gte] = precio_min;
            if (precio_max) whereClause.precio[Op.lte] = precio_max;
        }

        // Filtro por cantidad mínima
        if (cantidad_min) {
            whereClause.cantidad = { [Op.gte]: cantidad_min };
        }

        const includes = [
            {
                model: Usuario,
                attributes: ['id_usuario', 'nombre', 'apellido', 'telefono', 'verificado', 'ubicacion_lat', 'ubicacion_lng']
            },
            {
                model: Producto,
                attributes: ['id_producto', 'nombre', 'unidad_medida', 'imagen_url']
            }
        ];

        // Filtro por búsqueda en producto
        if (search) {
            includes[1].where = {
                nombre: { [Op.iLike]: `%${search}%` }
            };
            includes[1].required = true;
        }

        const { count, rows } = await AnuncioVenta.findAndCountAll({
            where: whereClause,
            include: includes,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_publicacion', 'DESC']],
            distinct: true
        });

        res.json({
            anuncios: rows,
            paginacion: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al listar anuncios de venta',
            details: error.message
        });
    }
};

/**
 * Listar anuncios de compra
 */
const listarAnunciosCompra = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            producto_id, 
            precio_min,
            precio_max,
            estado = 'activo'
        } = req.query;
        
        const offset = (page - 1) * limit;
        const whereClause = { estado };

        // Filtro por producto
        if (producto_id) {
            whereClause.id_producto = producto_id;
        }

        // Filtro por rango de precio
        if (precio_min || precio_max) {
            whereClause.precio_ofertado = {};
            if (precio_min) whereClause.precio_ofertado[Op.gte] = precio_min;
            if (precio_max) whereClause.precio_ofertado[Op.lte] = precio_max;
        }

        const includes = [
            {
                model: Usuario,
                attributes: ['id_usuario', 'nombre', 'apellido', 'telefono', 'verificado']
            },
            {
                model: Producto,
                attributes: ['id_producto', 'nombre', 'unidad_medida', 'imagen_url']
            }
        ];

        // Filtro por búsqueda en producto
        if (search) {
            includes[1].where = {
                nombre: { [Op.iLike]: `%${search}%` }
            };
            includes[1].required = true;
        }

        const { count, rows } = await AnuncioCompra.findAndCountAll({
            where: whereClause,
            include: includes,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_publicacion', 'DESC']],
            distinct: true
        });

        res.json({
            anuncios: rows,
            paginacion: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al listar anuncios de compra',
            details: error.message
        });
    }
};

/**
 * Obtener mis anuncios
 */
const obtenerMisAnuncios = async (req, res) => {
    try {
        const { tipo = 'venta' } = req.query;
        const Model = tipo === 'venta' ? AnuncioVenta : AnuncioCompra;

        const anuncios = await Model.findAll({
            where: { id_usuario: req.usuario.id_usuario },
            include: [
                {
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'unidad_medida', 'imagen_url']
                }
            ],
            order: [['fecha_publicacion', 'DESC']]
        });

        res.json({
            anuncios,
            tipo
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener mis anuncios',
            details: error.message
        });
    }
};

/**
 * Actualizar estado de anuncio
 */
const actualizarEstadoAnuncio = async (req, res) => {
    try {
        const { tipo, id } = req.params;
        const { estado } = req.body;

        const Model = tipo === 'venta' ? AnuncioVenta : AnuncioCompra;
        
        const anuncio = await Model.findOne({
            where: { 
                id_anuncio: id,
                id_usuario: req.usuario.id_usuario 
            }
        });

        if (!anuncio) {
            return res.status(404).json({
                error: 'Anuncio no encontrado o no tienes permisos para modificarlo'
            });
        }

        await anuncio.update({ estado });

        res.json({
            mensaje: 'Estado del anuncio actualizado exitosamente',
            anuncio
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar estado del anuncio',
            details: error.message
        });
    }
};

module.exports = {
    crearAnuncioVenta,
    crearAnuncioCompra,
    listarAnunciosVenta,
    listarAnunciosCompra,
    obtenerMisAnuncios,
    actualizarEstadoAnuncio
};