const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const anuncioController = require('../controllers/anuncio.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { handleValidationErrors, checkAnuncioLimit, incrementAnuncioCounter } = require('../middlewares/validation.middleware');

// Validaciones
const validarAnuncioVenta = [
    body('id_producto').isInt({ min: 1 }).withMessage('ID de producto debe ser un entero positivo'),
    body('cantidad').isFloat({ min: 0 }).withMessage('La cantidad debe ser un número positivo'),
    body('unidad').notEmpty().withMessage('La unidad es requerida'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('ubicacion').optional().isLength({ max: 200 }).withMessage('La ubicación no puede exceder 200 caracteres'),
    handleValidationErrors
];

const validarAnuncioCompra = [
    body('id_producto').isInt({ min: 1 }).withMessage('ID de producto debe ser un entero positivo'),
    body('cantidad').isFloat({ min: 0 }).withMessage('La cantidad debe ser un número positivo'),
    body('unidad').notEmpty().withMessage('La unidad es requerida'),
    body('precio_ofertado').isFloat({ min: 0 }).withMessage('El precio ofertado debe ser un número positivo'),
    handleValidationErrors
];

/**
 * @swagger
 * tags:
 *   name: Anuncios
 *   description: Gestión de anuncios B2B (compra y venta)
 */

/**
 * @swagger
 * /api/anuncios/venta:
 *   post:
 *     summary: Crear anuncio de venta
 *     tags: [Anuncios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - cantidad
 *               - unidad
 *               - precio
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: number
 *                 example: 100
 *               unidad:
 *                 type: string
 *                 example: "kg"
 *               precio:
 *                 type: number
 *                 example: 250.00
 *               descripcion:
 *                 type: string
 *                 example: "Papa blanca de primera calidad"
 *               ubicacion:
 *                 type: string
 *                 example: "La Paz, Bolivia"
 *               ubicacion_lat:
 *                 type: number
 *                 example: -16.5000
 *               ubicacion_lng:
 *                 type: number
 *                 example: -68.1500
 *     responses:
 *       201:
 *         description: Anuncio de venta creado exitosamente
 *       400:
 *         description: Error de validación
 *       429:
 *         description: Límite diario de anuncios alcanzado
 */
router.post('/venta', 
    verifyToken, 
    checkAnuncioLimit,
    validarAnuncioVenta, 
    anuncioController.crearAnuncioVenta,
    incrementAnuncioCounter
);

/**
 * @swagger
 * /api/anuncios/compra:
 *   post:
 *     summary: Crear anuncio de compra
 *     tags: [Anuncios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - cantidad
 *               - unidad
 *               - precio_ofertado
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: number
 *                 example: 50
 *               unidad:
 *                 type: string
 *                 example: "kg"
 *               precio_ofertado:
 *                 type: number
 *                 example: 200.00
 *               descripcion:
 *                 type: string
 *                 example: "Busco papa blanca de buena calidad"
 *     responses:
 *       201:
 *         description: Anuncio de compra creado exitosamente
 *       400:
 *         description: Error de validación
 *       429:
 *         description: Límite diario de anuncios alcanzado
 */
router.post('/compra', 
    verifyToken, 
    checkAnuncioLimit,
    validarAnuncioCompra, 
    anuncioController.crearAnuncioCompra,
    incrementAnuncioCounter
);

/**
 * @swagger
 * /api/anuncios/venta:
 *   get:
 *     summary: Listar anuncios de venta
 *     tags: [Anuncios]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre de producto
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: cantidad_min
 *         schema:
 *           type: number
 *         description: Cantidad mínima disponible
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           default: "activo"
 *         description: Estado del anuncio
 *     responses:
 *       200:
 *         description: Lista de anuncios de venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anuncios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnuncioVenta'
 *                 paginacion:
 *                   type: object
 */
router.get('/venta', anuncioController.listarAnunciosVenta);

/**
 * @swagger
 * /api/anuncios/compra:
 *   get:
 *     summary: Listar anuncios de compra
 *     tags: [Anuncios]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre de producto
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio mínimo ofertado
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo ofertado
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           default: "activo"
 *         description: Estado del anuncio
 *     responses:
 *       200:
 *         description: Lista de anuncios de compra
 */
router.get('/compra', anuncioController.listarAnunciosCompra);

/**
 * @swagger
 * /api/anuncios/mis-anuncios:
 *   get:
 *     summary: Obtener mis anuncios
 *     tags: [Anuncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [venta, compra]
 *           default: "venta"
 *         description: Tipo de anuncio
 *     responses:
 *       200:
 *         description: Lista de mis anuncios
 */
router.get('/mis-anuncios', verifyToken, anuncioController.obtenerMisAnuncios);

/**
 * @swagger
 * /api/anuncios/{tipo}/{id}/estado:
 *   put:
 *     summary: Actualizar estado de anuncio
 *     tags: [Anuncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [venta, compra]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, vendido, pausado, cancelado]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Anuncio no encontrado
 */
router.put('/:tipo/:id/estado', 
    verifyToken, 
    anuncioController.actualizarEstadoAnuncio
);

module.exports = router;
