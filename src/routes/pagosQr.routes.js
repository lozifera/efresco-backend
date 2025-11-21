const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const {
    crearPagoQr,
    obtenerPagosQr,
    obtenerPagoQrPorId,
    verificarPagoQr,
    obtenerEstadoPorCodigo,
    cancelarPagoQr
} = require('../controllers/pagoQr.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     PagoQr:
 *       type: object
 *       required:
 *         - id_pedido
 *         - monto
 *         - metodo_pago
 *       properties:
 *         id_pago_qr:
 *           type: integer
 *         id_pedido:
 *           type: integer
 *         monto:
 *           type: number
 *         metodo_pago:
 *           type: string
 *           enum: [yape, plin, bcp, interbank]
 *         codigo_qr:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [pendiente, completado, fallido, expirado, cancelado]
 */

/**
 * @swagger
 * /api/pagos-qr:
 *   post:
 *     summary: Crear nuevo pago QR
 *     tags: [Pagos QR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_pedido
 *               - monto
 *               - metodo_pago
 *             properties:
 *               id_pedido:
 *                 type: integer
 *               monto:
 *                 type: number
 *               metodo_pago:
 *                 type: string
 *                 enum: [yape, plin, bcp, interbank]
 *     responses:
 *       201:
 *         description: Código QR generado exitosamente
 */
router.post('/', 
    verifyToken,
    [
        body('id_pedido').isInt({ min: 1 }).withMessage('ID de pedido debe ser un entero positivo'),
        body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
        body('metodo_pago').isIn(['yape', 'plin', 'bcp', 'interbank']).withMessage('Método de pago inválido')
    ],
    handleValidationErrors,
    crearPagoQr
);

router.get('/', 
    verifyToken,
    checkRole(['administrador']),
    obtenerPagosQr
);

router.get('/:id', 
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un entero positivo')
    ],
    handleValidationErrors,
    obtenerPagoQrPorId
);

router.put('/:id/verificar',
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo')
    ],
    handleValidationErrors,
    verificarPagoQr
);

router.get('/codigo/:codigoQr',
    obtenerEstadoPorCodigo
);

router.delete('/:id',
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo')
    ],
    handleValidationErrors,
    cancelarPagoQr
);

module.exports = router;
