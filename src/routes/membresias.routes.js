const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const {
    crearMembresia,
    obtenerMembresias,
    obtenerMembresiaPorId,
    actualizarMembresia,
    eliminarMembresia,
    asignarMembresia,
    obtenerMembresiaUsuario,
    obtenerHistorialMembresias,
    cancelarMembresia,
    renovarMembresia,
    obtenerEstadisticasMembresias
} = require('../controllers/membresia.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Membresia:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - duracion_dias
 *       properties:
 *         id_membresia:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *         duracion_dias:
 *           type: integer
 */

// Rutas de membresías
router.post('/', 
    verifyToken,
    checkRole(['administrador']),
    [
        body('nombre').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
        body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('La descripción no debe exceder 500 caracteres'),
        body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
        body('duracion_dias').isInt({ min: 1 }).withMessage('La duración debe ser un entero positivo')
    ],
    handleValidationErrors,
    crearMembresia
);

router.get('/', obtenerMembresias);
router.get('/estadisticas', verifyToken, checkRole(['administrador']), obtenerEstadisticasMembresias);
router.get('/mi-membresia', verifyToken, obtenerMembresiaUsuario);
router.get('/historial', verifyToken, obtenerHistorialMembresias);
router.get('/:id', obtenerMembresiaPorId);

router.put('/:id',
    verifyToken,
    checkRole(['administrador']),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        body('nombre').optional().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
        body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
        body('duracion_dias').optional().isInt({ min: 1 }).withMessage('La duración debe ser un entero positivo')
    ],
    handleValidationErrors,
    actualizarMembresia
);

router.put('/cancelar', verifyToken, cancelarMembresia);
router.put('/renovar/:id', verifyToken, renovarMembresia);

router.delete('/:id',
    verifyToken,
    checkRole(['administrador']),
    eliminarMembresia
);

// Rutas de asignación de membresías
router.post('/asignar', 
    verifyToken,
    [
        body('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario debe ser un entero positivo'),
        body('id_membresia').isInt({ min: 1 }).withMessage('ID de membresía debe ser un entero positivo')
    ],
    handleValidationErrors,
    asignarMembresia
);

module.exports = router;
