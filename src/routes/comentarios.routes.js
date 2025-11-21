const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const {
    crearComentario,
    obtenerComentariosPorProducto,
    obtenerComentariosPorAnuncio,
    obtenerComentariosPorUsuario,
    obtenerTodosLosComentarios,
    actualizarComentario,
    eliminarComentario,
    obtenerEstadisticasComentarios
} = require('../controllers/comentario.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comentario:
 *       type: object
 *       required:
 *         - id_usuario
 *         - comentario
 *       properties:
 *         id_comentario:
 *           type: integer
 *         id_usuario:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         id_anuncio_venta:
 *           type: integer
 *         comentario:
 *           type: string
 */

router.post('/', 
    verifyToken,
    [
        body('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario debe ser un entero positivo'),
        body('comentario').trim().isLength({ min: 1, max: 1000 }).withMessage('El comentario debe tener entre 1 y 1000 caracteres'),
        body('id_producto').optional().isInt({ min: 1 }).withMessage('ID de producto debe ser un entero positivo'),
        body('id_anuncio_venta').optional().isInt({ min: 1 }).withMessage('ID de anuncio debe ser un entero positivo')
    ],
    handleValidationErrors,
    crearComentario
);

router.get('/producto/:productId', obtenerComentariosPorProducto);
router.get('/anuncio/:anuncioId', obtenerComentariosPorAnuncio);
router.get('/usuario/:userId', verifyToken, obtenerComentariosPorUsuario);
router.get('/estadisticas', verifyToken, checkRole(['administrador']), obtenerEstadisticasComentarios);
router.get('/', verifyToken, checkRole(['administrador']), obtenerTodosLosComentarios);

router.put('/:id',
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        body('comentario').trim().isLength({ min: 1, max: 1000 }).withMessage('El comentario debe tener entre 1 y 1000 caracteres')
    ],
    handleValidationErrors,
    actualizarComentario
);

router.delete('/:id', verifyToken, eliminarComentario);

module.exports = router;
