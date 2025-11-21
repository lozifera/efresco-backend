const { Producto, Categoria, ProductoCategoria } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * Crear nuevo producto
 */
const crearProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            unidad_medida,
            precio_referencial,
            imagen_url,
            categorias = []
        } = req.body;

        // Crear producto
        const nuevoProducto = await Producto.create({
            nombre,
            descripcion,
            unidad_medida,
            precio_referencial,
            imagen_url
        });

        // Asignar categorías
        for (const idCategoria of categorias) {
            await ProductoCategoria.create({
                id_producto: nuevoProducto.id_producto,
                id_categoria: idCategoria
            });
        }

        // Obtener producto con categorías
        const productoCompleto = await Producto.findByPk(nuevoProducto.id_producto, {
            include: [{
                model: Categoria,
                through: { attributes: [] }
            }]
        });

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            producto: {
                ...productoCompleto.toJSON(),
                categorias: productoCompleto.Categoria?.map(cat => ({
                    id_categoria: cat.id_categoria,
                    nombre: cat.nombre
                })) || []
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear producto',
            details: error.message
        });
    }
};

/**
 * Listar productos con filtros
 */
const listarProductos = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            categoria, 
            unidad_medida,
            precio_min,
            precio_max 
        } = req.query;
        
        const offset = (page - 1) * limit;
        const whereClause = { estado: true };
        const includes = [{
            model: Categoria,
            through: { attributes: [] }
        }];

        // Filtro por búsqueda en nombre o descripción
        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { descripcion: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Filtro por unidad de medida
        if (unidad_medida) {
            whereClause.unidad_medida = unidad_medida;
        }

        // Filtro por rango de precio
        if (precio_min || precio_max) {
            whereClause.precio_referencial = {};
            if (precio_min) whereClause.precio_referencial[Op.gte] = precio_min;
            if (precio_max) whereClause.precio_referencial[Op.lte] = precio_max;
        }

        // Filtro por categoría
        if (categoria) {
            includes[0].where = { id_categoria: categoria };
            includes[0].required = true;
        }

        const { count, rows } = await Producto.findAndCountAll({
            where: whereClause,
            include: includes,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_registro', 'DESC']],
            distinct: true // Para contar correctamente con JOIN
        });

        res.json({
            productos: rows.map(producto => ({
                ...producto.toJSON(),
                categorias: producto.Categoria?.map(cat => ({
                    id_categoria: cat.id_categoria,
                    nombre: cat.nombre
                })) || []
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
            error: 'Error al listar productos',
            details: error.message
        });
    }
};

/**
 * Obtener producto por ID
 */
const obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id, {
            include: [{
                model: Categoria,
                through: { attributes: [] }
            }]
        });

        if (!producto || !producto.estado) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            producto: {
                ...producto.toJSON(),
                categorias: producto.Categoria?.map(cat => ({
                    id_categoria: cat.id_categoria,
                    nombre: cat.nombre
                })) || []
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener producto',
            details: error.message
        });
    }
};

/**
 * Actualizar producto
 */
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            unidad_medida,
            precio_referencial,
            imagen_url
        } = req.body;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        await producto.update({
            nombre: nombre || producto.nombre,
            descripcion: descripcion || producto.descripcion,
            unidad_medida: unidad_medida || producto.unidad_medida,
            precio_referencial: precio_referencial || producto.precio_referencial,
            imagen_url: imagen_url || producto.imagen_url
        });

        res.json({
            mensaje: 'Producto actualizado exitosamente',
            producto
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar producto',
            details: error.message
        });
    }
};

/**
 * Eliminar producto (soft delete)
 */
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        await producto.update({ estado: false });

        res.json({
            mensaje: 'Producto eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar producto',
            details: error.message
        });
    }
};

/**
 * Subir imagen para un producto
 */
const subirImagenProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha seleccionado ningún archivo'
            });
        }

        // Verificar que el producto existe
        const producto = await Producto.findByPk(id);
        if (!producto) {
            // Eliminar archivo subido si el producto no existe
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Crear URL completa para la imagen
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imagenUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
        // Calcular tamaño en MB
        const tamañoMB = (req.file.size / 1024 / 1024).toFixed(2);

        // Actualizar producto con la nueva imagen
        await producto.update({
            imagen_url: imagenUrl,
            tamaño_imagen_mb: tamañoMB
        });

        res.json({
            success: true,
            message: 'Imagen subida exitosamente',
            data: {
                imagen_url: imagenUrl,
                tamaño_mb: tamañoMB,
                nombre_archivo: req.file.filename
            }
        });

    } catch (error) {
        console.error('Error al subir imagen:', error);
        
        // Eliminar archivo si hubo error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Eliminar imagen de un producto
 */
const eliminarImagenProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (producto.imagen_url) {
            // Extraer nombre del archivo de la URL
            const fileName = path.basename(producto.imagen_url);
            const filePath = path.join(__dirname, '../public/uploads', fileName);

            // Eliminar archivo físico si existe
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Actualizar base de datos
            await producto.update({
                imagen_url: null,
                imagen_comprimida_url: null,
                tamaño_imagen_mb: null
            });

            res.json({
                success: true,
                message: 'Imagen eliminada exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'El producto no tiene imagen asociada'
            });
        }

    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearProducto,
    listarProductos,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto,
    subirImagenProducto,
    eliminarImagenProducto
};