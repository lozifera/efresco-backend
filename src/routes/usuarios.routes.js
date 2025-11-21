const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

// Validaciones
const validarRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email debe tener formato válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
];

const validarLogin = [
    body('email').isEmail().withMessage('Email debe tener formato válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors
];

// Validaciones para recuperación de contraseña
const validarSolicitudRecuperacion = [
    body('email').isEmail().withMessage('Email debe tener formato válido'),
    handleValidationErrors
];

const validarVerificacionToken = [
    body('token').notEmpty().withMessage('Token es requerido'),
    handleValidationErrors
];

const validarRestablecerPassword = [
    body('token').notEmpty().withMessage('Token es requerido'),
    body('nueva_password').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
    handleValidationErrors
];

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               telefono:
 *                 type: string
 *                 example: "+591 70123456"
 *               direccion:
 *                 type: string
 *                 example: "Av. Siempre Viva 123"
 *               ubicacion_lat:
 *                 type: number
 *                 example: -16.5000
 *               ubicacion_lng:
 *                 type: number
 *                 example: -68.1500
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cliente"]
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 *       400:
 *         description: Error de validación o email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/registro', validarRegistro, usuarioController.registrarUsuario);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validarLogin, usuarioController.iniciarSesion);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido o faltante
 */
router.get('/perfil', verifyToken, usuarioController.obtenerPerfil);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ubicacion_lat:
 *                 type: number
 *               ubicacion_lng:
 *                 type: number
 *               documento_identidad:
 *                 type: string
 *               foto_perfil_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       401:
 *         description: Token inválido o faltante
 */
router.put('/perfil', verifyToken, usuarioController.actualizarPerfil);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sin permisos de administrador
 */
router.get('/', verifyToken, checkRole(['administrador']), usuarioController.listarUsuarios);

/**
 * @swagger
 * /api/usuarios/recuperar-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado (si existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Si el email existe, se enviará un correo de recuperación"
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/recuperar-password', validarSolicitudRecuperacion, usuarioController.solicitarRecuperacionPassword);

/**
 * @swagger
 * /api/usuarios/verificar-token:
 *   post:
 *     summary: Verificar validez del token de recuperación
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a1b2c3d4e5f6..."
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Token válido"
 *                 token_valido:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verificar-token', validarVerificacionToken, usuarioController.verificarTokenRecuperacion);

/**
 * @swagger
 * /api/usuarios/restablecer-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - nueva_password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a1b2c3d4e5f6..."
 *               nueva_password:
 *                 type: string
 *                 minLength: 8
 *                 example: "nuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Token inválido, expirado o datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/restablecer-password', validarRestablecerPassword, usuarioController.restablecerPassword);

module.exports = router;
