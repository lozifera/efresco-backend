const { Pedido, Usuario } = require('../models');

// Crear nuevo pedido
const crearPedido = async (req, res) => {
    try {
        const { id_comprador, id_vendedor, id_anuncio, tipo_anuncio, monto_total } = req.body;

        // Verificar que los usuarios existen
        const comprador = await Usuario.findByPk(id_comprador);
        const vendedor = await Usuario.findByPk(id_vendedor);

        if (!comprador) {
            return res.status(404).json({
                success: false,
                message: 'Comprador no encontrado'
            });
        }

        if (!vendedor) {
            return res.status(404).json({
                success: false,
                message: 'Vendedor no encontrado'
            });
        }

        const nuevoPedido = await Pedido.create({
            id_comprador,
            id_vendedor,
            id_anuncio,
            tipo_anuncio,
            monto_total,
            estado: 'pendiente'
        });

        const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id_pedido, {
            include: [
                {
                    model: Usuario,
                    as: 'Comprador',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                },
                {
                    model: Usuario,
                    as: 'Vendedor',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: pedidoCompleto
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener todos los pedidos
const obtenerPedidos = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (estado) {
            whereCondition.estado = estado;
        }

        const { count, rows } = await Pedido.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Usuario,
                    as: 'Comprador',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                },
                {
                    model: Usuario,
                    as: 'Vendedor',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener pedido por ID
const obtenerPedidoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'Comprador',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                },
                {
                    model: Usuario,
                    as: 'Vendedor',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                }
            ]
        });

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.json({
            success: true,
            data: pedido
        });

    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener pedidos de un usuario
const obtenerPedidosUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { tipo = 'todos', page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereCondition = {};
        
        if (tipo === 'comprador') {
            whereCondition.id_comprador = usuarioId;
        } else if (tipo === 'vendedor') {
            whereCondition.id_vendedor = usuarioId;
        } else {
            whereCondition = {
                [require('sequelize').Op.or]: [
                    { id_comprador: usuarioId },
                    { id_vendedor: usuarioId }
                ]
            };
        }

        const { count, rows } = await Pedido.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Usuario,
                    as: 'Comprador',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                },
                {
                    model: Usuario,
                    as: 'Vendedor',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar pedido
const actualizarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, monto_total } = req.body;

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        const updateData = {};
        if (estado) updateData.estado = estado;
        if (monto_total !== undefined) updateData.monto_total = monto_total;

        await pedido.update(updateData);

        const pedidoActualizado = await Pedido.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'Comprador',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                },
                {
                    model: Usuario,
                    as: 'Vendedor',
                    attributes: ['id_usuario', 'nombre', 'telefono']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: pedidoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Cancelar pedido
const cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (pedido.estado === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'El pedido ya está cancelado'
            });
        }

        if (pedido.estado === 'completado') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar un pedido completado'
            });
        }

        await pedido.update({ estado: 'cancelado' });

        res.json({
            success: true,
            message: 'Pedido cancelado exitosamente',
            data: pedido
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    obtenerPedidosUsuario,
    actualizarPedido,
    cancelarPedido
};