const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const productoController = require('../controllers/producto.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { handleImageUpload } = require('../middlewares/upload.middleware');

// Validaciones
const validarCrearProducto = [
    body('nombre').notEmpty().withMessage('El nombre del producto es requerido'),
    body('unidad_medida').notEmpty().withMessage('La unidad de medida es requerida'),
    body('precio_referencial').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    handleValidationErrors
];

const validarId = [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos agrícolas
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos con filtros
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de productos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: unidad_medida
 *         schema:
 *           type: string
 *         description: Filtrar por unidad de medida
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
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 paginacion:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', productoController.listarProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validarId, productoController.obtenerProducto);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear nuevo producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - unidad_medida
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Papa blanca"
 *               descripcion:
 *                 type: string
 *                 example: "Papa de calidad premium"
 *               unidad_medida:
 *                 type: string
 *                 example: "kg"
 *               precio_referencial:
 *                 type: number
 *                 example: 2.50
 *               imagen_url:
 *                 type: string
 *                 example: "https://example.com/papa.jpg"
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sin permisos de administrador
 */
router.post('/', 
    verifyToken, 
    checkRole(['administrador']), 
    validarCrearProducto, 
    productoController.crearProducto
);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               unidad_medida:
 *                 type: string
 *               precio_referencial:
 *                 type: number
 *               imagen_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', 
    verifyToken, 
    checkRole(['administrador']), 
    validarId, 
    productoController.actualizarProducto
);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', 
    verifyToken, 
    checkRole(['administrador']), 
    validarId, 
    productoController.eliminarProducto
);

/**
 * @swagger
 * /api/productos/{id}/imagen:
 *   post:
 *     summary: Subir imagen para un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (JPG, PNG, GIF, WEBP - máx 5MB)
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imagen_url:
 *                       type: string
 *                     tamaño_mb:
 *                       type: number
 *                     nombre_archivo:
 *                       type: string
 */
router.post('/:id/imagen', 
    verifyToken,
    validarId,
    handleImageUpload,
    productoController.subirImagenProducto
);

/**
 * @swagger
 * /api/productos/{id}/imagen:
 *   delete:
 *     summary: Eliminar imagen de un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id/imagen', 
    verifyToken,
    validarId,
    productoController.eliminarImagenProducto
);

module.exports = router;
