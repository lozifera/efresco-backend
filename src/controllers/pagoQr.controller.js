const { PagoQr, Pedido, Usuario } = require('../models');

/**
 * @desc    Crear nuevo pago QR
 * @route   POST /api/pagos-qr
 * @access  Private
 */
const crearPagoQr = async (req, res) => {
    try {
        const { id_pedido, monto, metodo_pago, datos_qr } = req.body;

        // Verificar que el pedido existe
        const pedido = await Pedido.findByPk(id_pedido);
        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // Verificar que el monto coincide con el pedido
        if (monto !== pedido.precio_total) {
            return res.status(400).json({
                success: false,
                message: 'El monto no coincide con el total del pedido'
            });
        }

        // Generar código QR único
        const codigoQr = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const nuevoPago = await PagoQr.create({
            id_pedido,
            monto,
            metodo_pago,
            codigo_qr: codigoQr,
            datos_qr: datos_qr || {},
            estado: 'pendiente',
            fecha_creacion: new Date(),
            fecha_expiracion: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
        });

        const pagoCompleto = await PagoQr.findByPk(nuevoPago.id_pago_qr, {
            include: [
                {
                    model: Pedido,
                    include: [
                        {
                            model: Usuario,
                            as: 'comprador',
                            attributes: ['id_usuario', 'nombre', 'email']
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Código QR generado exitosamente',
            data: pagoCompleto
        });

    } catch (error) {
        console.error('Error al crear pago QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener todos los pagos QR
 * @route   GET /api/pagos-qr
 * @access  Private (Admin)
 */
const obtenerPagosQr = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (estado) {
            whereCondition.estado = estado;
        }

        const { count, rows: pagos } = await PagoQr.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Pedido,
                    include: [
                        {
                            model: Usuario,
                            as: 'comprador',
                            attributes: ['id_usuario', 'nombre', 'email']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_creacion', 'DESC']]
        });

        res.json({
            success: true,
            data: pagos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener pagos QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener pago QR por ID
 * @route   GET /api/pagos-qr/:id
 * @access  Private
 */
const obtenerPagoQrPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pagoQr = await PagoQr.findByPk(id, {
            include: [
                {
                    model: Pedido,
                    include: [
                        {
                            model: Usuario,
                            as: 'comprador',
                            attributes: ['id_usuario', 'nombre', 'email', 'telefono']
                        }
                    ]
                }
            ]
        });

        if (!pagoQr) {
            return res.status(404).json({
                success: false,
                message: 'Pago QR no encontrado'
            });
        }

        // Verificar si el código QR ha expirado
        const ahora = new Date();
        if (pagoQr.fecha_expiracion && ahora > pagoQr.fecha_expiracion && pagoQr.estado === 'pendiente') {
            await pagoQr.update({ estado: 'expirado' });
            pagoQr.estado = 'expirado';
        }

        res.json({
            success: true,
            data: pagoQr
        });

    } catch (error) {
        console.error('Error al obtener pago QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Verificar y procesar pago QR
 * @route   PUT /api/pagos-qr/:id/verificar
 * @access  Private
 */
const verificarPagoQr = async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo_verificacion, datos_pago } = req.body;

        const pagoQr = await PagoQr.findByPk(id, {
            include: [
                {
                    model: Pedido
                }
            ]
        });

        if (!pagoQr) {
            return res.status(404).json({
                success: false,
                message: 'Pago QR no encontrado'
            });
        }

        // Verificar si ya está procesado
        if (pagoQr.estado === 'completado') {
            return res.status(400).json({
                success: false,
                message: 'El pago ya ha sido procesado'
            });
        }

        // Verificar expiración
        const ahora = new Date();
        if (pagoQr.fecha_expiracion && ahora > pagoQr.fecha_expiracion) {
            await pagoQr.update({ estado: 'expirado' });
            return res.status(400).json({
                success: false,
                message: 'El código QR ha expirado'
            });
        }

        // Simular verificación del pago (aquí integrarías con el proveedor de pagos)
        const pagoVerificado = true; // En un caso real, verificarías con la API del banco/billetera

        if (pagoVerificado) {
            // Actualizar el pago QR
            await pagoQr.update({
                estado: 'completado',
                fecha_pago: new Date(),
                codigo_verificacion,
                datos_pago: datos_pago || {}
            });

            // Actualizar el pedido relacionado
            await pagoQr.Pedido.update({ estado: 'pagado' });

            const pagoActualizado = await PagoQr.findByPk(id, {
                include: [
                    {
                        model: Pedido,
                        include: [
                            {
                                model: Usuario,
                                as: 'comprador',
                                attributes: ['id_usuario', 'nombre', 'email']
                            }
                        ]
                    }
                ]
            });

            res.json({
                success: true,
                message: 'Pago verificado y procesado exitosamente',
                data: pagoActualizado
            });
        } else {
            await pagoQr.update({ estado: 'fallido' });
            res.status(400).json({
                success: false,
                message: 'No se pudo verificar el pago'
            });
        }

    } catch (error) {
        console.error('Error al verificar pago QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener estado del pago por código QR
 * @route   GET /api/pagos-qr/codigo/:codigoQr
 * @access  Public
 */
const obtenerEstadoPorCodigo = async (req, res) => {
    try {
        const { codigoQr } = req.params;

        const pagoQr = await PagoQr.findOne({
            where: { codigo_qr: codigoQr },
            attributes: ['id_pago_qr', 'estado', 'monto', 'fecha_expiracion', 'fecha_creacion'],
            include: [
                {
                    model: Pedido,
                    attributes: ['id_pedido', 'precio_total'],
                    include: [
                        {
                            model: Usuario,
                            as: 'comprador',
                            attributes: ['nombre']
                        }
                    ]
                }
            ]
        });

        if (!pagoQr) {
            return res.status(404).json({
                success: false,
                message: 'Código QR no válido'
            });
        }

        // Verificar expiración
        const ahora = new Date();
        if (pagoQr.fecha_expiracion && ahora > pagoQr.fecha_expiracion && pagoQr.estado === 'pendiente') {
            await pagoQr.update({ estado: 'expirado' });
            pagoQr.estado = 'expirado';
        }

        res.json({
            success: true,
            data: pagoQr
        });

    } catch (error) {
        console.error('Error al obtener estado por código:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Cancelar pago QR
 * @route   DELETE /api/pagos-qr/:id
 * @access  Private
 */
const cancelarPagoQr = async (req, res) => {
    try {
        const { id } = req.params;

        const pagoQr = await PagoQr.findByPk(id);
        
        if (!pagoQr) {
            return res.status(404).json({
                success: false,
                message: 'Pago QR no encontrado'
            });
        }

        if (pagoQr.estado === 'completado') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar un pago completado'
            });
        }

        await pagoQr.update({ estado: 'cancelado' });

        res.json({
            success: true,
            message: 'Pago QR cancelado exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar pago QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearPagoQr,
    obtenerPagosQr,
    obtenerPagoQrPorId,
    verificarPagoQr,
    obtenerEstadoPorCodigo,
    cancelarPagoQr
};