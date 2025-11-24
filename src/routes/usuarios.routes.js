const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { handleCloudinaryUpload } = require('../middlewares/cloudinary.middleware');

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

// Validaciones para administración
const validarActualizacionAdmin = [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Email debe tener formato válido'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono debe tener formato válido'),
    body('verificado').optional().isBoolean().withMessage('Verificado debe ser verdadero o falso'),
    body('estado').optional().isBoolean().withMessage('Estado debe ser verdadero o falso'),
    handleValidationErrors
];

const validarCambioEstado = [
    body('verificado').optional().isBoolean().withMessage('Verificado debe ser verdadero o falso'),
    body('estado').optional().isBoolean().withMessage('Estado debe ser verdadero o falso'),
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
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener datos de usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', usuarioController.obtenerUsuarioPorId);

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
 *     summary: 📋 Listar todos los usuarios (Solo Admin)
 *     description: |
 *       🔐 **Requiere rol administrador**
 *       
 *       Obtiene una lista paginada de todos los usuarios registrados en el sistema.
 *       Incluye información completa de cada usuario y sus roles asignados.
 *       
 *       💡 **Funcionalidades:**
 *       - ✅ Paginación automática
 *       - ✅ Información de roles
 *       - ✅ Datos de contacto completos
 *       - ✅ Estado de verificación
 *     tags: [🔧 Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 📄 Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 🔢 Cantidad de elementos por página
 *         example: 10
 *     responses:
 *       200:
 *         description: ✅ Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaUsuarios'
 *             example:
 *               usuarios:
 *                 - id_usuario: 1
 *                   nombre: "Juan"
 *                   apellido: "Pérez"
 *                   email: "juan@ejemplo.com"
 *                   telefono: "+591 70123456"
 *                   direccion: "Av. Siempreviva 123"
 *                   verificado: true
 *                   estado: true
 *                   fecha_registro: "2024-01-15T10:30:00.000Z"
 *                   foto_perfil_url: "https://res.cloudinary.com/..."
 *                   roles: ["cliente"]
 *               paginacion:
 *                 total: 25
 *                 page: 1
 *                 limit: 10
 *                 pages: 3
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 🚫 Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyToken, checkRole(['administrador']), usuarioController.listarUsuarios);

/**
 * @swagger
 * /api/usuarios/admin/{id}:
 *   get:
 *     summary: 👤 Obtener usuario específico (Admin)
 *     description: |
 *       🔐 **Requiere rol administrador**
 *       
 *       Obtiene la información completa de un usuario específico,
 *       incluyendo todos sus datos personales, estado de verificación,
 *       roles asignados y metadatos del sistema.
 *       
 *       💡 **Caso de uso ideal:**
 *       - 🔍 Ver detalles completos antes de editar
 *       - 📊 Revisar historial y estado del usuario
 *       - 🛡️ Verificar roles y permisos asignados
 *     tags: [🔧 Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 🆔 ID único del usuario
 *         example: 5
 *     responses:
 *       200:
 *         description: ✅ Usuario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioAdmin'
 *             example:
 *               id_usuario: 5
 *               nombre: "María"
 *               apellido: "García"
 *               email: "maria@ejemplo.com"
 *               telefono: "+591 71234567"
 *               direccion: "Calle Las Flores 456"
 *               ubicacion_lat: -17.7833
 *               ubicacion_lng: -63.1821
 *               verificado: false
 *               estado: true
 *               fecha_registro: "2024-01-20T14:15:00.000Z"
 *               foto_perfil_url: null
 *               roles: ["cliente", "vendedor"]
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token no proporcionado o inválido"
 *       403:
 *         description: 🚫 Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Acceso denegado. Se requiere rol de administrador"
 *       404:
 *         description: 🔍 Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/:id', verifyToken, checkRole(['administrador']), usuarioController.obtenerUsuarioAdmin);

/**
 * @swagger
 * /api/usuarios/admin/{id}:
 *   put:
 *     summary: ✏️ Actualizar usuario completo (Admin)
 *     description: |
 *       🔐 **Requiere rol administrador**
 *       
 *       Actualiza la información completa de un usuario. Permite modificar
 *       todos los campos disponibles incluyendo datos personales, contacto,
 *       ubicación, estado de verificación y estado de la cuenta.
 *       
 *       ⚠️ **Consideraciones importantes:**
 *       - 📧 El email debe ser único en el sistema
 *       - 🔄 Todos los campos son opcionales
 *       - ✅ Se puede cambiar verificación y estado
 *       - 📍 Se puede actualizar ubicación GPS
 *       
 *       💡 **Caso de uso:**
 *       - 📝 Edición completa de perfil de usuario
 *       - 🔧 Corrección de datos por soporte
 *       - 📍 Actualización de información de contacto
 *     tags: [🔧 Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 🆔 ID único del usuario a actualizar
 *         example: 5
 *     requestBody:
 *       required: true
 *       description: 📄 Datos a actualizar (todos los campos son opcionales)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizacionUsuario'
 *           examples:
 *             actualizacion_completa:
 *               summary: 📝 Actualización completa
 *               value:
 *                 nombre: "Juan Carlos"
 *                 apellido: "Pérez Mendoza"
 *                 email: "juancarlos@ejemplo.com"
 *                 telefono: "+591 70123456"
 *                 direccion: "Av. Siempreviva 123, Zona Norte"
 *                 ubicacion_lat: -17.7833
 *                 ubicacion_lng: -63.1821
 *                 verificado: true
 *                 estado: true
 *             solo_contacto:
 *               summary: 📞 Solo información de contacto
 *               value:
 *                 telefono: "+591 75555555"
 *                 direccion: "Nueva dirección 456"
 *             cambio_estado:
 *               summary: 🔄 Solo cambio de estados
 *               value:
 *                 verificado: true
 *                 estado: true
 *     responses:
 *       200:
 *         description: ✅ Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioAdmin'
 *             example:
 *               mensaje: "Usuario actualizado exitosamente"
 *               usuario:
 *                 id_usuario: 5
 *                 nombre: "Juan Carlos"
 *                 apellido: "Pérez Mendoza"
 *                 email: "juancarlos@ejemplo.com"
 *                 telefono: "+591 70123456"
 *                 direccion: "Av. Siempreviva 123, Zona Norte"
 *                 ubicacion_lat: -17.7833
 *                 ubicacion_lng: -63.1821
 *                 verificado: true
 *                 estado: true
 *                 fecha_registro: "2024-01-20T14:15:00.000Z"
 *                 roles: ["cliente", "vendedor"]
 *       400:
 *         description: ❌ Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "El email ya está registrado por otro usuario"
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 🚫 Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 🔍 Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/admin/:id', verifyToken, checkRole(['administrador']), validarActualizacionAdmin, usuarioController.actualizarUsuarioAdmin);

/**
 * @swagger
 * /api/usuarios/admin/{id}:
 *   patch:
 *     summary: 🔄 Cambiar estado o verificación (Admin) ⚡
 *     description: |
 *       🔐 **Requiere rol administrador**
 *       
 *       **🚀 EL ENDPOINT MÁS ÚTIL PARA ADMINISTRADORES**
 *       
 *       Permite cambios rápidos y específicos del estado del usuario.
 *       Perfecto para acciones administrativas comunes como verificar
 *       usuarios nuevos o activar/desactivar cuentas problemáticas.
 *       
 *       ⚡ **Ventajas del PATCH:**
 *       - 🚀 **Más rápido** que PUT (solo envías lo que cambias)
 *       - 🎯 **Más específico** para acciones puntuales
 *       - 🛡️ **Más seguro** (menor riesgo de sobrescribir datos)
 *       - 📱 **Ideal para interfaces simples** (botones de verificar/activar)
 *       
 *       📋 **Casos de uso principales:**
 *       - ✅ **Verificar usuario nuevo:** `{"verificado": true}`
 *       - 🚫 **Desactivar cuenta problemática:** `{"estado": false}`
 *       - 🔄 **Reactivar cuenta:** `{"estado": true}`
 *       - 🎯 **Cambio combinado:** `{"verificado": true, "estado": true}`
 *     tags: [🔧 Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 🆔 ID único del usuario
 *         example: 5
 *     requestBody:
 *       required: true
 *       description: |
 *         📋 **Al menos un campo es requerido**
 *         
 *         Puedes enviar solo `verificado`, solo `estado`, o ambos campos.
 *         El endpoint es flexible y solo actualizará los campos proporcionados.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioEstado'
 *           examples:
 *             verificar_usuario:
 *               summary: ✅ Verificar usuario
 *               description: Aprobar usuario nuevo o pendiente
 *               value:
 *                 verificado: true
 *             desactivar_cuenta:
 *               summary: 🚫 Desactivar cuenta
 *               description: Suspender cuenta problemática
 *               value:
 *                 estado: false
 *             reactivar_cuenta:
 *               summary: 🔄 Reactivar cuenta
 *               description: Restaurar cuenta suspendida
 *               value:
 *                 estado: true
 *             aprobar_completamente:
 *               summary: 🎯 Verificar y activar
 *               description: Acción completa para usuario nuevo
 *               value:
 *                 verificado: true
 *                 estado: true
 *             suspender_sin_verificar:
 *               summary: ⚠️ Suspender y desverificar
 *               description: Para casos de cuentas fraudulentas
 *               value:
 *                 verificado: false
 *                 estado: false
 *     responses:
 *       200:
 *         description: ✅ Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Estado actualizado exitosamente"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id_usuario:
 *                       type: integer
 *                       example: 5
 *                     verificado:
 *                       type: boolean
 *                       example: true
 *                     estado:
 *                       type: boolean
 *                       example: true
 *             examples:
 *               verificado_exitoso:
 *                 summary: ✅ Usuario verificado
 *                 value:
 *                   mensaje: "Estado actualizado exitosamente"
 *                   usuario:
 *                     id_usuario: 5
 *                     verificado: true
 *                     estado: true
 *               desactivado_exitoso:
 *                 summary: 🚫 Usuario desactivado
 *                 value:
 *                   mensaje: "Estado actualizado exitosamente"
 *                   usuario:
 *                     id_usuario: 5
 *                     verificado: true
 *                     estado: false
 *       400:
 *         description: ❌ Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Debe proporcionar al menos un campo: verificado o estado"
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 🚫 Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 🔍 Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/admin/:id', verifyToken, checkRole(['administrador']), validarCambioEstado, usuarioController.cambiarEstadoUsuario);

/**
 * @swagger
 * /api/usuarios/admin/{id}:
 *   delete:
 *     summary: 🗑️ Eliminar usuario (Admin)
 *     description: |
 *       🔐 **Requiere rol administrador**
 *       
 *       **⚠️ ACCIÓN IRREVERSIBLE**
 *       
 *       Elimina permanentemente un usuario del sistema. El endpoint
 *       incluye validaciones inteligentes para prevenir la eliminación
 *       de usuarios que tienen datos relacionados importantes.
 *       
 *       🛡️ **Validaciones automáticas:**
 *       - 🛒 **Productos creados** por el usuario
 *       - 📦 **Pedidos realizados** o recibidos
 *       - 💬 **Conversaciones de chat** activas
 *       
 *       💡 **Recomendación:**
 *       En lugar de eliminar, considera **desactivar** el usuario:
 *       ```
 *       PATCH /api/usuarios/admin/{id}
 *       {"estado": false}
 *       ```
 *       
 *       ✅ **Cuándo usar eliminación:**
 *       - 🧪 Usuarios de prueba sin actividad
 *       - 🤖 Cuentas bot detectadas
 *       - 📝 Registros duplicados accidentales
 *       - 🚫 Cuentas creadas por error
 *       
 *       ❌ **Cuándo NO eliminar:**
 *       - 👤 Usuarios con historial comercial
 *       - 💬 Usuarios con conversaciones
 *       - 📊 Cuentas con datos de valor para reportes
 *     tags: [🔧 Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 🆔 ID único del usuario a eliminar
 *         example: 5
 *     responses:
 *       200:
 *         description: ✅ Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               mensaje: "Usuario eliminado exitosamente"
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 🚫 Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 🔍 Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Usuario no encontrado"
 *       409:
 *         description: ⚠️ No se puede eliminar - Tiene datos relacionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictResponse'
 *             examples:
 *               con_actividad_comercial:
 *                 summary: 🛒 Usuario con actividad comercial
 *                 value:
 *                   error: "No se puede eliminar el usuario porque tiene datos relacionados"
 *                   detalles:
 *                     productos: 5
 *                     pedidos: 12
 *                     chats: 3
 *                   sugerencia: "Considere desactivar el usuario en lugar de eliminarlo"
 *               solo_productos:
 *                 summary: 📦 Usuario solo con productos
 *                 value:
 *                   error: "No se puede eliminar el usuario porque tiene datos relacionados"
 *                   detalles:
 *                     productos: 2
 *                     pedidos: 0
 *                     chats: 0
 *                   sugerencia: "Considere desactivar el usuario en lugar de eliminarlo"
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/admin/:id', verifyToken, checkRole(['administrador']), usuarioController.eliminarUsuarioAdmin);

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

/**
 * @swagger
 * /api/usuarios/foto-perfil:
 *   post:
 *     summary: 📷 Subir foto de perfil
 *     description: |
 *       🔐 **Requiere autenticación de usuario**
 *       
 *       Sube una imagen de perfil del usuario que se almacena permanentemente
 *       en **Cloudinary** (servicio en la nube). La imagen se optimiza
 *       automáticamente para web y está disponible globalmente.
 *       
 *       ☁️ **Almacenamiento en Cloudinary:**
 *       - ✅ **Permanente** (no se pierde con redeploys)
 *       - 🌍 **CDN global** (carga rápida desde cualquier lugar)
 *       - 🔧 **Optimización automática** (compresión y formatos)
 *       - 📱 **Responsive** (diferentes tamaños según dispositivo)
 *       
 *       🎯 **Campo flexible:**
 *       Puedes usar cualquier nombre de campo: `imagen`, `foto`, `avatar`, `file`, etc.
 *       El middleware es inteligente y detecta automáticamente el archivo.
 *       
 *       📋 **Formatos soportados:**
 *       - JPG/JPEG (recomendado)
 *       - PNG (con transparencia)
 *       - WEBP (moderna, menor tamaño)
 *       - GIF (animaciones simples)
 *       
 *       ⚠️ **Límites:**
 *       - Tamaño máximo: **10MB**
 *       - Solo imágenes (no documentos)
 *     tags: [👥 Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: 📁 Archivo de imagen del perfil
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   🖼️ Archivo de imagen del perfil
 *                   
 *                   **Formatos:** JPG, JPEG, PNG, WEBP, GIF
 *                   **Tamaño máximo:** 10MB
 *                   **Nombre del campo:** Flexible (imagen, foto, avatar, file, etc.)
 *           examples:
 *             imagen_perfil:
 *               summary: 📷 Subir imagen de perfil
 *               description: Campo con nombre 'imagen'
 *               # El ejemplo se mostraría en la interfaz como un selector de archivo
 *     responses:
 *       200:
 *         description: ✅ Foto de perfil subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Foto de perfil subida exitosamente"
 *                 foto_perfil_url:
 *                   type: string
 *                   format: uri
 *                   description: URL permanente de Cloudinary
 *                   example: "https://res.cloudinary.com/efresco/image/upload/v1732345678/usuarios/perfil_abc123def456.jpg"
 *                 file_info:
 *                   type: object
 *                   description: 📊 Información técnica del archivo
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "perfil_abc123def456.jpg"
 *                       description: Nombre único generado por Cloudinary
 *                     size:
 *                       type: number
 *                       example: 245760
 *                       description: Tamaño en bytes
 *                     mimetype:
 *                       type: string
 *                       example: "image/jpeg"
 *                       description: Tipo MIME del archivo
 *                     width:
 *                       type: number
 *                       example: 800
 *                       description: Ancho en píxeles
 *                     height:
 *                       type: number
 *                       example: 600
 *                       description: Alto en píxeles
 *                     cloudinary_id:
 *                       type: string
 *                       example: "usuarios/perfil_abc123def456"
 *                       description: ID único en Cloudinary
 *             example:
 *               mensaje: "Foto de perfil subida exitosamente"
 *               foto_perfil_url: "https://res.cloudinary.com/efresco/image/upload/v1732345678/usuarios/perfil_abc123def456.jpg"
 *               file_info:
 *                 filename: "perfil_abc123def456.jpg"
 *                 size: 245760
 *                 mimetype: "image/jpeg"
 *                 width: 800
 *                 height: 600
 *                 cloudinary_id: "usuarios/perfil_abc123def456"
 *       400:
 *         description: ❌ Error en la subida del archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_archivo:
 *                 summary: 📂 No se envió archivo
 *                 value:
 *                   error: "No se subió ningún archivo"
 *               formato_invalido:
 *                 summary: 🚫 Formato no soportado
 *                 value:
 *                   error: "Formato de archivo no soportado. Usa JPG, PNG, WEBP o GIF"
 *               muy_grande:
 *                 summary: 📏 Archivo muy grande
 *                 value:
 *                   error: "El archivo es demasiado grande. Máximo 10MB permitido"
 *       401:
 *         description: 🔒 Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 💥 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               error_cloudinary:
 *                 summary: ☁️ Error de Cloudinary
 *                 value:
 *                   error: "Error al subir imagen a Cloudinary"
 *                   details: "Servicio temporalmente no disponible"
 *               error_servidor:
 *                 summary: 🔧 Error del servidor
 *                 value:
 *                   error: "Error interno del servidor"
 *                   details: "Error al procesar la imagen"
 */
router.post('/foto-perfil', verifyToken, handleCloudinaryUpload, usuarioController.subirFotoPerfil);

/**
 * @swagger
 * /api/usuarios/foto-perfil:
 *   delete:
 *     summary: Eliminar foto de perfil
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto de perfil eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Foto de perfil eliminada exitosamente"
 *       401:
 *         description: Token inválido o faltante
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/foto-perfil', verifyToken, usuarioController.eliminarFotoPerfil);

module.exports = router;
