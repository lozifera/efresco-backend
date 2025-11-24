const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🌱 EFresco API - Plataforma Agrícola',
            version: '2.0.0',
            description: `
                ## 🚀 API Completa para Plataforma de Comercio Agrícola B2B
                
                **EFresco** es una plataforma innovadora que conecta productores agrícolas con compradores,
                facilitando el comercio de productos frescos de manera eficiente y segura.
                
                ### 🔑 Características principales:
                - 👥 **Gestión de usuarios** con roles (cliente, vendedor, administrador)
                - 📦 **Catálogo de productos** agrícolas con imágenes
                - 💰 **Sistema de anuncios** de compra y venta
                - 💬 **Chat en tiempo real** entre usuarios
                - ⭐ **Sistema de reputación** y comentarios
                - 🏆 **Membresías premium** para vendedores
                - 💳 **Pagos QR** integrados
                - 🔧 **Panel de administración** completo
                
                ### 🛡️ Autenticación:
                La mayoría de endpoints requieren autenticación JWT.
                Usa el botón "Authorize" para añadir tu token.
                
                ### 📱 Almacenamiento:
                - **Imágenes**: Cloudinary (permanente)
                - **Base de datos**: PostgreSQL
                - **Deploy**: Render.com
            `,
            contact: {
                name: '🌱 EFresco Development Team',
                email: 'dev@efresco.com',
                url: 'https://efresco.com'
            },
            license: {
                name: 'MIT License',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? 'https://efresco-backend.onrender.com'
                    : `http://localhost:${process.env.PORT || 3001}`,
                description: process.env.NODE_ENV === 'production' 
                    ? '🚀 Servidor de Producción (Render)'
                    : '🛠️ Servidor de Desarrollo Local'
            }
        ],
        tags: [
            {
                name: '👥 Usuarios',
                description: 'Registro, autenticación y gestión de perfiles de usuario'
            },
            {
                name: '🔧 Admin - Usuarios', 
                description: '🛡️ Administración completa de usuarios (Solo Admin)'
            },
            {
                name: '📦 Productos',
                description: 'Gestión del catálogo de productos agrícolas'
            },
            {
                name: '📢 Anuncios',
                description: 'Anuncios de compra y venta de productos'
            },
            {
                name: '🛒 Pedidos',
                description: 'Gestión de pedidos y transacciones'
            },
            {
                name: '💬 Chat',
                description: 'Sistema de mensajería entre usuarios'
            },
            {
                name: '⭐ Reputación',
                description: 'Sistema de calificaciones y comentarios'
            },
            {
                name: '❤️ Favoritos',
                description: 'Productos y vendedores favoritos'
            },
            {
                name: '🏆 Membresías',
                description: 'Planes premium para vendedores'
            },
            {
                name: '💳 Pagos QR',
                description: 'Códigos QR para pagos'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: '🔑 Ingresa tu token JWT aquí. Formato: Bearer <tu_token>'
                }
            },
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        id_usuario: { type: 'integer', example: 1, description: 'ID único del usuario' },
                        nombre: { type: 'string', example: 'Juan', description: 'Nombre del usuario' },
                        apellido: { type: 'string', example: 'Pérez', description: 'Apellido del usuario' },
                        email: { type: 'string', format: 'email', example: 'juan@ejemplo.com', description: 'Email único' },
                        telefono: { type: 'string', example: '+591 70123456', description: 'Teléfono de contacto' },
                        direccion: { type: 'string', example: 'Av. Siempreviva 123', description: 'Dirección física' },
                        ubicacion_lat: { type: 'number', format: 'float', example: -17.7833, description: 'Latitud GPS' },
                        ubicacion_lng: { type: 'number', format: 'float', example: -63.1821, description: 'Longitud GPS' },
                        verificado: { type: 'boolean', example: false, description: 'Estado de verificación' },
                        estado: { type: 'boolean', example: true, description: 'Usuario activo/inactivo' },
                        foto_perfil_url: { type: 'string', example: 'https://res.cloudinary.com/...', description: 'URL de Cloudinary' },
                        fecha_registro: { type: 'string', format: 'date-time', description: 'Fecha de registro' },
                        roles: { type: 'array', items: { type: 'string' }, example: ['cliente'], description: 'Roles asignados' }
                    }
                },
                UsuarioAdmin: {
                    type: 'object',
                    description: '👤 Usuario con información completa para administradores',
                    allOf: [{ $ref: '#/components/schemas/Usuario' }]
                },
                ActualizacionUsuario: {
                    type: 'object',
                    description: '✏️ Datos para actualizar usuario (Admin)',
                    properties: {
                        nombre: { type: 'string', example: 'Juan Carlos', description: 'Nuevo nombre' },
                        apellido: { type: 'string', example: 'Pérez Mendoza', description: 'Nuevo apellido' },
                        email: { type: 'string', format: 'email', example: 'juancarlos@ejemplo.com', description: 'Nuevo email' },
                        telefono: { type: 'string', example: '+591 70123456', description: 'Nuevo teléfono' },
                        direccion: { type: 'string', example: 'Nueva dirección 456', description: 'Nueva dirección' },
                        ubicacion_lat: { type: 'number', format: 'float', example: -17.7833 },
                        ubicacion_lng: { type: 'number', format: 'float', example: -63.1821 },
                        verificado: { type: 'boolean', example: true, description: 'Cambiar verificación' },
                        estado: { type: 'boolean', example: true, description: 'Activar/desactivar' }
                    }
                },
                CambioEstado: {
                    type: 'object',
                    description: '🔄 Cambio rápido de estado (PATCH)',
                    properties: {
                        verificado: { type: 'boolean', example: true, description: 'Verificar/desverificar usuario' },
                        estado: { type: 'boolean', example: false, description: 'Activar/desactivar cuenta' }
                    },
                    example: {
                        verificado: true
                    }
                },
                Producto: {
                    type: 'object',
                    properties: {
                        id_producto: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Papa blanca premium' },
                        descripcion: { type: 'string', example: 'Papa de calidad superior, ideal para consumo directo' },
                        unidad_medida: { type: 'string', example: 'kg', enum: ['kg', 'quintales', 'toneladas', 'unidades'] },
                        precio_referencial: { type: 'number', format: 'float', example: 2.50, description: 'Precio en Bs.' },
                        imagen_url: { type: 'string', example: 'https://res.cloudinary.com/efresco/image/upload/...' },
                        id_categoria: { type: 'integer', example: 1 },
                        id_usuario: { type: 'integer', example: 1, description: 'ID del vendedor' },
                        fecha_creacion: { type: 'string', format: 'date-time' },
                        activo: { type: 'boolean', example: true }
                    }
                },
                PaginacionResponse: {
                    type: 'object',
                    description: '📄 Información de paginación',
                    properties: {
                        total: { type: 'integer', example: 150, description: 'Total de elementos' },
                        page: { type: 'integer', example: 1, description: 'Página actual' },
                        limit: { type: 'integer', example: 10, description: 'Elementos por página' },
                        pages: { type: 'integer', example: 15, description: 'Total de páginas' }
                    }
                },
                ListaUsuarios: {
                    type: 'object',
                    description: '📋 Lista paginada de usuarios',
                    properties: {
                        usuarios: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Usuario' }
                        },
                        paginacion: { $ref: '#/components/schemas/PaginacionResponse' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    description: '✅ Respuesta exitosa',
                    properties: {
                        mensaje: { type: 'string', example: 'Operación exitosa' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    description: '❌ Respuesta de error',
                    properties: {
                        error: { type: 'string', example: 'Descripción del error' },
                        details: { 
                            oneOf: [
                                { type: 'string' },
                                { type: 'array', items: { type: 'string' } },
                                { type: 'object' }
                            ]
                        }
                    }
                },
                ConflictResponse: {
                    type: 'object',
                    description: '⚠️ Error de conflicto (ej: no se puede eliminar)',
                    properties: {
                        error: { type: 'string', example: 'No se puede eliminar el usuario porque tiene datos relacionados' },
                        detalles: {
                            type: 'object',
                            properties: {
                                productos: { type: 'integer', example: 5 },
                                pedidos: { type: 'integer', example: 12 },
                                chats: { type: 'integer', example: 3 }
                            }
                        },
                        sugerencia: { type: 'string', example: 'Considere desactivar el usuario en lugar de eliminarlo' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJSDoc(options);

const swaggerSetup = (app) => {
    // CSS personalizado para mejor apariencia
    const customCss = `
        .swagger-ui .topbar { display: none }
        .swagger-ui { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .swagger-ui .info { margin: 50px 0; }
        .swagger-ui .info .title {
            font-size: 36px;
            color: #2c5530;
            text-align: center;
            margin-bottom: 10px;
        }
        .swagger-ui .info .description {
            font-size: 16px;
            line-height: 1.6;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #4CAF50;
        }
        .swagger-ui .scheme-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .swagger-ui .opblock.opblock-get .opblock-summary {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .swagger-ui .opblock.opblock-post .opblock-summary {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        .swagger-ui .opblock.opblock-put .opblock-summary {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        .swagger-ui .opblock.opblock-patch .opblock-summary {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }
        .swagger-ui .opblock.opblock-delete .opblock-summary {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        }
        .swagger-ui .opblock-tag {
            font-size: 18px;
            font-weight: bold;
            padding: 10px 0;
            border-bottom: 2px solid #4CAF50;
            margin-bottom: 15px;
            color: #2c5530;
        }
        .swagger-ui .btn.authorize {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 10px 20px;
            font-weight: bold;
        }
        .swagger-ui .btn.try-out {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            border-radius: 20px;
        }
        .swagger-ui .response-col_description {
            background: #f8f9fa;
            border-radius: 5px;
            padding: 10px;
        }
    `;
    
    const swaggerOptions = {
        customCss,
        customSiteTitle: '🌱 EFresco API - Documentación Completa',
        customfavIcon: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha'
        }
    };
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
    
    // Endpoint para obtener el JSON de la especificación
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(specs);
    });
    
    // Ruta de ayuda
    app.get('/api-help', (req, res) => {
        res.json({
            mensaje: '🌱 Bienvenido a EFresco API',
            documentacion: `${req.protocol}://${req.get('host')}/api-docs`,
            version: specs.info.version,
            endpoints_principales: {
                usuarios: '/api/usuarios',
                productos: '/api/productos', 
                admin: '/api/usuarios/admin',
                auth: '/api/usuarios/login'
            },
            nota: 'Visita /api-docs para la documentación completa con ejemplos'
        });
    });
};

module.exports = swaggerSetup;