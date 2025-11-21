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
    cancelarPedido
} = require('../controllers/pedido.controller');

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
    ],
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

module.exports = router;
