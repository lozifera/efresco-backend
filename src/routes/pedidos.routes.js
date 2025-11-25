/**
 * @swagger
 * /api/pedidos/simular-pago-venta:
 *   post:
 *     summary: Simula el pago y crea un pedido para un anuncio de venta.
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_anuncio_venta:
 *                 type: integer
 *                 example: 123
 *               id_usuario_comprador:
 *                 type: integer
 *                 example: 456
 *     responses:
 *       200:
 *         description: Pedido creado y pagado exitosamente.
 */
/**
 * @swagger
 * /api/pedidos/simular-pago-compra:
 *   post:
 *     summary: Simula el pago y crea un pedido para un anuncio de compra.
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_anuncio_compra:
 *                 type: integer
 *                 example: 789
 *               id_usuario_vendedor:
 *                 type: integer
 *                 example: 456
 *     responses:
 *       200:
 *         description: Pedido creado y pagado exitosamente.
 */
/**
 * @swagger
 * /api/pedidos/{id}/verificar:
 *   patch:
 *     summary: Verificar o marcar como cumplido un pedido manualmente.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificado_manualmente:
 *                 type: boolean
 *                 example: true
 *               notas_verificacion:
 *                 type: string
 *                 example: "Pedido entregado y verificado por el vendedor"
 *     responses:
 *       200:
 *         description: Pedido verificado exitosamente.
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    obtenerPedidosUsuario,
    actualizarPedido,
    cancelarPedido,
    pagarPedido,
    verificarPedido
} = require('../controllers/pedido.controller');
// Simular pago de pedido
router.post('/:id/pagar', 
    verifyToken,
    pagarPedido
);

// Crear pedido
router.post('/', 
    verifyToken,
    [
        body('id_comprador')
            .isInt({ min: 1 })
            .withMessage('ID de comprador debe ser un entero positivo'),
        body('id_vendedor')
            .isInt({ min: 1 })
            .withMessage('ID de vendedor debe ser un entero positivo'),
        body('monto_total')
            .isFloat({ min: 0 })
            .withMessage('El monto total debe ser un número positivo'),
        body('tipo_anuncio')
            .optional()
            .isIn(['compra', 'venta'])
            .withMessage('Tipo de anuncio debe ser compra o venta'),
        body('id_anuncio')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID de anuncio debe ser un entero positivo')
    ],
    handleValidationErrors,
    crearPedido
);

// Obtener todos los pedidos (Admin)
router.get('/', 
    verifyToken,
    checkRole(['admin']),
    [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La página debe ser un número entero positivo'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe ser entre 1 y 100'),
        query('estado')
            .optional()
            .isIn(['pendiente', 'pagado', 'enviado', 'completado', 'cancelado'])
            .withMessage('Estado inválido')
    ],
    handleValidationErrors,
    obtenerPedidos
);

// Obtener pedido por ID
router.get('/:id', 
    verifyToken,
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID del pedido debe ser un entero positivo')
    ],
    handleValidationErrors,
    obtenerPedidoPorId
);

// Obtener pedidos de un usuario
router.get('/usuario/:usuarioId', 
    verifyToken,
    [
        param('usuarioId')
            .isInt({ min: 1 })
            .withMessage('ID del usuario debe ser un entero positivo'),
        query('tipo')
            .optional()
            .isIn(['todos', 'comprador', 'vendedor'])
            .withMessage('Tipo debe ser: todos, comprador o vendedor'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La página debe ser un número entero positivo'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe ser entre 1 y 100')
    },
    handleValidationErrors,
    obtenerPedidosUsuario
);

// Actualizar pedido
router.put('/:id', 
    verifyToken,
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID del pedido debe ser un entero positivo'),
        body('estado')
            .optional()
            .isIn(['pendiente', 'pagado', 'enviado', 'completado', 'cancelado'])
            .withMessage('Estado inválido'),
        body('monto_total')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('El monto total debe ser un número positivo')
    ],
    handleValidationErrors,
    actualizarPedido
);

// Cancelar pedido
router.patch('/:id/cancelar', 
    verifyToken,
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID del pedido debe ser un entero positivo')
    ],
    handleValidationErrors,
    cancelarPedido
);

// Verificar pedido
router.patch('/:id/verificar', 
    verifyToken,
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID del pedido debe ser un entero positivo'),
        body('verificado_manualmente')
            .isBoolean()
            .withMessage('Verificado manualmente debe ser verdadero o falso'),
        body('notas_verificacion')
            .optional()
            .isString()
            .withMessage('Las notas de verificación deben ser un texto')
    ],
    handleValidationErrors,
    verificarPedido
);

module.exports = router;
