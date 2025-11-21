const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const {
    crearReputacion,
    obtenerReputacionUsuario,
    obtenerCalificacionesDadas,
    obtenerRankingUsuarios,
    actualizarReputacion,
    eliminarReputacion,
    obtenerEstadisticasGenerales
} = require('../controllers/reputacion.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reputacion:
 *       type: object
 *       required:
 *         - id_usuario_calificado
 *         - id_usuario_calificador
 *         - calificacion
 *       properties:
 *         id_reputacion:
 *           type: integer
 *         id_usuario_calificado:
 *           type: integer
 *         id_usuario_calificador:
 *           type: integer
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comentario:
 *           type: string
 */

router.post('/', 
    verifyToken,
    [
        body('id_usuario_calificado').isInt({ min: 1 }).withMessage('ID de usuario calificado debe ser un entero positivo'),
        body('id_usuario_calificador').isInt({ min: 1 }).withMessage('ID de usuario calificador debe ser un entero positivo'),
        body('calificacion').isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5'),
        body('comentario').optional().trim().isLength({ max: 500 }).withMessage('El comentario no debe exceder 500 caracteres'),
        body('id_pedido').optional().isInt({ min: 1 }).withMessage('ID de pedido debe ser un entero positivo')
    ],
    handleValidationErrors,
    crearReputacion
);

router.get('/usuario/:userId', obtenerReputacionUsuario);
router.get('/calificadas/:userId', verifyToken, obtenerCalificacionesDadas);
router.get('/ranking', obtenerRankingUsuarios);
router.get('/estadisticas', verifyToken, checkRole(['administrador']), obtenerEstadisticasGenerales);

router.put('/:id',
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        body('calificacion').optional().isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5'),
        body('comentario').optional().trim().isLength({ max: 500 }).withMessage('El comentario no debe exceder 500 caracteres')
    ],
    handleValidationErrors,
    actualizarReputacion
);

router.delete('/:id', verifyToken, eliminarReputacion);

module.exports = router;
