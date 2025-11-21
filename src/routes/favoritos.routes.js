const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
    agregarFavorito,
    obtenerFavoritos,
    verificarFavorito,
    obtenerFavoritosPopulares,
    eliminarFavorito,
    eliminarFavoritoPorElemento,
    obtenerEstadisticasFavoritos
} = require('../controllers/favoritos.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorito:
 *       type: object
 *       properties:
 *         id_favorito:
 *           type: integer
 *         id_usuario:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         id_anuncio_venta:
 *           type: integer
 */

router.post('/', 
    verifyToken,
    [
        body('id_producto').optional().isInt({ min: 1 }).withMessage('ID de producto debe ser un entero positivo'),
        body('id_anuncio_venta').optional().isInt({ min: 1 }).withMessage('ID de anuncio debe ser un entero positivo')
    ],
    handleValidationErrors,
    agregarFavorito
);

router.get('/', verifyToken, obtenerFavoritos);
router.get('/verificar', verifyToken, verificarFavorito);
router.get('/populares', obtenerFavoritosPopulares);
router.get('/estadisticas', verifyToken, obtenerEstadisticasFavoritos);

router.delete('/:id',
    verifyToken,
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo')
    ],
    handleValidationErrors,
    eliminarFavorito
);

router.delete('/elemento', verifyToken, eliminarFavoritoPorElemento);

module.exports = router;
