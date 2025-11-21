const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
    crearChat,
    obtenerChatsUsuario,
    obtenerMensajesChat,
    enviarMensaje,
    marcarMensajesComoLeidos,
    obtenerMensajesNoLeidos,
    eliminarChat,
    interactuarConChatbot,
    obtenerHistorialChatbot
} = require('../controllers/chat.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id_chat:
 *           type: integer
 *         id_usuario_1:
 *           type: integer
 *         id_usuario_2:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [privado, grupo]
 *     Mensaje:
 *       type: object
 *       properties:
 *         id_mensaje:
 *           type: integer
 *         id_chat:
 *           type: integer
 *         id_usuario_remitente:
 *           type: integer
 *         contenido:
 *           type: string
 *         tipo_mensaje:
 *           type: string
 *           enum: [texto, imagen, archivo]
 */

// Rutas de chat
router.post('/', 
    verifyToken,
    [
        body('id_usuario_destinatario').isInt({ min: 1 }).withMessage('ID de usuario destinatario debe ser un entero positivo'),
        body('tipo').optional().isIn(['privado', 'grupo']).withMessage('Tipo de chat inválido')
    ],
    handleValidationErrors,
    crearChat
);

router.get('/', verifyToken, obtenerChatsUsuario);
router.get('/no-leidos', verifyToken, obtenerMensajesNoLeidos);

router.get('/:chatId/mensajes',
    verifyToken,
    [
        param('chatId').isInt({ min: 1 }).withMessage('El ID del chat debe ser un entero positivo')
    ],
    handleValidationErrors,
    obtenerMensajesChat
);

router.post('/:chatId/mensajes',
    verifyToken,
    [
        param('chatId').isInt({ min: 1 }).withMessage('El ID del chat debe ser un entero positivo'),
        body('contenido').trim().isLength({ min: 1, max: 1000 }).withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
        body('tipo_mensaje').optional().isIn(['texto', 'imagen', 'archivo']).withMessage('Tipo de mensaje inválido')
    ],
    handleValidationErrors,
    enviarMensaje
);

router.put('/:chatId/marcar-leido',
    verifyToken,
    [
        param('chatId').isInt({ min: 1 }).withMessage('El ID del chat debe ser un entero positivo')
    ],
    handleValidationErrors,
    marcarMensajesComoLeidos
);

router.delete('/:chatId',
    verifyToken,
    [
        param('chatId').isInt({ min: 1 }).withMessage('El ID del chat debe ser un entero positivo')
    ],
    handleValidationErrors,
    eliminarChat
);

// Rutas de chatbot
router.post('/chatbot', 
    verifyToken,
    [
        body('mensaje').trim().isLength({ min: 1, max: 500 }).withMessage('El mensaje debe tener entre 1 y 500 caracteres')
    ],
    handleValidationErrors,
    interactuarConChatbot
);

router.get('/chatbot/historial', verifyToken, obtenerHistorialChatbot);

module.exports = router;
