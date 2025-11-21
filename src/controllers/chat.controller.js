const { Chat, Mensaje, ChatbotLog, Usuario } = require('../models');

/**
 * @desc    Crear nuevo chat
 * @route   POST /api/chat
 * @access  Private
 */
const crearChat = async (req, res) => {
    try {
        const { id_usuario_destinatario, tipo = 'privado' } = req.body;
        const id_usuario_remitente = req.usuario.id_usuario;

        // Verificar que no esté intentando crear un chat consigo mismo
        if (id_usuario_remitente === id_usuario_destinatario) {
            return res.status(400).json({
                success: false,
                message: 'No puedes crear un chat contigo mismo'
            });
        }

        // Verificar si ya existe un chat entre estos usuarios
        const chatExistente = await Chat.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    {
                        id_usuario_1: id_usuario_remitente,
                        id_usuario_2: id_usuario_destinatario
                    },
                    {
                        id_usuario_1: id_usuario_destinatario,
                        id_usuario_2: id_usuario_remitente
                    }
                ],
                tipo: 'privado'
            }
        });

        if (chatExistente) {
            return res.json({
                success: true,
                message: 'Chat ya existente',
                data: chatExistente
            });
        }

        // Verificar que el usuario destinatario existe
        const usuarioDestinatario = await Usuario.findByPk(id_usuario_destinatario);
        if (!usuarioDestinatario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario destinatario no encontrado'
            });
        }

        const nuevoChat = await Chat.create({
            id_usuario_1: id_usuario_remitente,
            id_usuario_2: id_usuario_destinatario,
            tipo,
            fecha_creacion: new Date(),
            activo: true
        });

        const chatCompleto = await Chat.findByPk(nuevoChat.id_chat, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario1',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                },
                {
                    model: Usuario,
                    as: 'usuario2',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Chat creado exitosamente',
            data: chatCompleto
        });

    } catch (error) {
        console.error('Error al crear chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener chats del usuario
 * @route   GET /api/chat
 * @access  Private
 */
const obtenerChatsUsuario = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: chats } = await Chat.findAndCountAll({
            where: {
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario },
                    { id_usuario_2: id_usuario }
                ],
                activo: true
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario1',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                },
                {
                    model: Usuario,
                    as: 'usuario2',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_ultimo_mensaje', 'DESC']]
        });

        // Obtener el último mensaje de cada chat
        const chatsConUltimoMensaje = await Promise.all(
            chats.map(async (chat) => {
                const ultimoMensaje = await Mensaje.findOne({
                    where: { id_chat: chat.id_chat },
                    order: [['fecha_envio', 'DESC']],
                    attributes: ['contenido', 'fecha_envio', 'id_usuario_remitente']
                });

                return {
                    ...chat.toJSON(),
                    ultimoMensaje
                };
            })
        );

        res.json({
            success: true,
            data: chatsConUltimoMensaje,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener mensajes de un chat
 * @route   GET /api/chat/:chatId/mensajes
 * @access  Private
 */
const obtenerMensajesChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const id_usuario = req.usuario.id_usuario;
        const offset = (page - 1) * limit;

        // Verificar que el usuario pertenece al chat
        const chat = await Chat.findOne({
            where: {
                id_chat: chatId,
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario },
                    { id_usuario_2: id_usuario }
                ]
            }
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este chat'
            });
        }

        const { count, rows: mensajes } = await Mensaje.findAndCountAll({
            where: { id_chat: chatId },
            include: [
                {
                    model: Usuario,
                    as: 'remitente',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_envio', 'DESC']]
        });

        res.json({
            success: true,
            data: mensajes.reverse(), // Mostrar del más antiguo al más reciente
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Enviar mensaje
 * @route   POST /api/chat/:chatId/mensajes
 * @access  Private
 */
const enviarMensaje = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { contenido, tipo_mensaje = 'texto' } = req.body;
        const id_usuario_remitente = req.usuario.id_usuario;

        // Verificar que el usuario pertenece al chat
        const chat = await Chat.findOne({
            where: {
                id_chat: chatId,
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario_remitente },
                    { id_usuario_2: id_usuario_remitente }
                ],
                activo: true
            }
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este chat'
            });
        }

        const nuevoMensaje = await Mensaje.create({
            id_chat: chatId,
            id_usuario_remitente,
            contenido,
            tipo_mensaje,
            fecha_envio: new Date(),
            leido: false
        });

        // Actualizar la fecha del último mensaje en el chat
        await chat.update({ fecha_ultimo_mensaje: new Date() });

        const mensajeCompleto = await Mensaje.findByPk(nuevoMensaje.id_mensaje, {
            include: [
                {
                    model: Usuario,
                    as: 'remitente',
                    attributes: ['id_usuario', 'nombre', 'imagen_perfil']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            data: mensajeCompleto
        });

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Marcar mensajes como leídos
 * @route   PUT /api/chat/:chatId/marcar-leido
 * @access  Private
 */
const marcarMensajesComoLeidos = async (req, res) => {
    try {
        const { chatId } = req.params;
        const id_usuario = req.usuario.id_usuario;

        // Verificar que el usuario pertenece al chat
        const chat = await Chat.findOne({
            where: {
                id_chat: chatId,
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario },
                    { id_usuario_2: id_usuario }
                ]
            }
        });

        if (!chat) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este chat'
            });
        }

        // Marcar como leídos todos los mensajes que NO fueron enviados por el usuario actual
        await Mensaje.update(
            { leido: true },
            {
                where: {
                    id_chat: chatId,
                    id_usuario_remitente: { [require('sequelize').Op.ne]: id_usuario },
                    leido: false
                }
            }
        );

        res.json({
            success: true,
            message: 'Mensajes marcados como leídos'
        });

    } catch (error) {
        console.error('Error al marcar mensajes como leídos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener mensajes no leídos
 * @route   GET /api/chat/no-leidos
 * @access  Private
 */
const obtenerMensajesNoLeidos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        // Obtener todos los chats del usuario
        const chats = await Chat.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario },
                    { id_usuario_2: id_usuario }
                ],
                activo: true
            },
            attributes: ['id_chat']
        });

        const chatIds = chats.map(chat => chat.id_chat);

        // Contar mensajes no leídos en todos los chats
        const mensajesNoLeidos = await Mensaje.count({
            where: {
                id_chat: { [require('sequelize').Op.in]: chatIds },
                id_usuario_remitente: { [require('sequelize').Op.ne]: id_usuario },
                leido: false
            }
        });

        // Obtener detalle por chat
        const detallesPorChat = await Promise.all(
            chatIds.map(async (chatId) => {
                const count = await Mensaje.count({
                    where: {
                        id_chat: chatId,
                        id_usuario_remitente: { [require('sequelize').Op.ne]: id_usuario },
                        leido: false
                    }
                });

                return {
                    chatId,
                    mensajesNoLeidos: count
                };
            })
        );

        res.json({
            success: true,
            data: {
                totalMensajesNoLeidos: mensajesNoLeidos,
                detallesPorChat: detallesPorChat.filter(item => item.mensajesNoLeidos > 0)
            }
        });

    } catch (error) {
        console.error('Error al obtener mensajes no leídos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Desactivar/eliminar chat
 * @route   DELETE /api/chat/:chatId
 * @access  Private
 */
const eliminarChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const chat = await Chat.findOne({
            where: {
                id_chat: chatId,
                [require('sequelize').Op.or]: [
                    { id_usuario_1: id_usuario },
                    { id_usuario_2: id_usuario }
                ]
            }
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat no encontrado'
            });
        }

        await chat.update({ activo: false });

        res.json({
            success: true,
            message: 'Chat eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ==================== CHATBOT ====================

/**
 * @desc    Interactuar con chatbot
 * @route   POST /api/chat/chatbot
 * @access  Private
 */
const interactuarConChatbot = async (req, res) => {
    try {
        const { mensaje, contexto } = req.body;
        const id_usuario = req.usuario.id_usuario;

        // Registrar la consulta del usuario
        await ChatbotLog.create({
            id_usuario,
            mensaje_usuario: mensaje,
            contexto: contexto || {},
            fecha_consulta: new Date()
        });

        // Simular procesamiento del chatbot (aquí integrarías con tu IA/NLP)
        const respuestaBot = await procesarMensajeChatbot(mensaje, contexto);

        // Actualizar el log con la respuesta
        const logActualizado = await ChatbotLog.findOne({
            where: { id_usuario, mensaje_usuario: mensaje },
            order: [['fecha_consulta', 'DESC']]
        });

        if (logActualizado) {
            await logActualizado.update({
                respuesta_bot: respuestaBot,
                fecha_respuesta: new Date()
            });
        }

        res.json({
            success: true,
            data: {
                respuesta: respuestaBot,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error en interacción con chatbot:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener historial de chatbot
 * @route   GET /api/chat/chatbot/historial
 * @access  Private
 */
const obtenerHistorialChatbot = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: historial } = await ChatbotLog.findAndCountAll({
            where: { id_usuario },
            attributes: ['id_chatbot_log', 'mensaje_usuario', 'respuesta_bot', 'fecha_consulta', 'fecha_respuesta'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_consulta', 'DESC']]
        });

        res.json({
            success: true,
            data: historial,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener historial de chatbot:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Función auxiliar para procesar mensajes del chatbot
const procesarMensajeChatbot = async (mensaje, _contexto) => {
    // Aquí implementarías la lógica del chatbot
    // Por ahora, una respuesta simple basada en palabras clave
    
    const mensajeLower = mensaje.toLowerCase();
    
    if (mensajeLower.includes('precio') || mensajeLower.includes('costo')) {
        return 'Puedes encontrar información sobre precios en la sección de productos. ¿Te puedo ayudar con algo específico?';
    }
    
    if (mensajeLower.includes('producto') || mensajeLower.includes('comprar')) {
        return 'Te puedo ayudar a encontrar productos. ¿Qué tipo de producto agrícola estás buscando?';
    }
    
    if (mensajeLower.includes('pedido') || mensajeLower.includes('orden')) {
        return 'Para información sobre tus pedidos, puedes revisar la sección "Mis Pedidos" en tu perfil.';
    }
    
    if (mensajeLower.includes('hola') || mensajeLower.includes('saludo')) {
        return '¡Hola! Soy el asistente virtual de EFresco. ¿En qué puedo ayudarte hoy?';
    }
    
    return 'Gracias por tu mensaje. Te puedo ayudar con información sobre productos agrícolas, pedidos, precios y más. ¿Puedes ser más específico sobre lo que necesitas?';
};

module.exports = {
    // Chat básico
    crearChat,
    obtenerChatsUsuario,
    obtenerMensajesChat,
    enviarMensaje,
    marcarMensajesComoLeidos,
    obtenerMensajesNoLeidos,
    eliminarChat,
    
    // Chatbot
    interactuarConChatbot,
    obtenerHistorialChatbot
};