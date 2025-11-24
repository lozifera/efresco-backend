const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EFresco API - Plataforma Agrícola',
            version: '2.0.0',
            description: `
                API completa para plataforma de comercio agrícola B2B.
                
                **Características principales:**
                - Gestión de usuarios con roles (cliente, vendedor, administrador)
                - Catálogo de productos agrícolas con imágenes
                - Sistema de anuncios de compra y venta
                - Chat en tiempo real entre usuarios
                - Sistema de reputación y comentarios
                - Membresías premium para vendedores
                - Pagos QR integrados
                - Panel de administración completo
                
                **Autenticación:**
                La mayoría de endpoints requieren autenticación JWT.
                Usa el botón "Authorize" para añadir tu token.
            `,
            contact: {
                name: 'EFresco Development Team',
                email: 'dev@efresco.com'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? 'https://efresco-backend.onrender.com'
                    : `http://localhost:${process.env.PORT || 3001}`,
                description: process.env.NODE_ENV === 'production' 
                    ? 'Servidor de Producción (Render)'
                    : 'Servidor de Desarrollo Local'
            }
        ],
        tags: [
            {
                name: 'Usuarios',
                description: 'Registro, autenticación y gestión de perfiles de usuario'
            },
            {
                name: 'Admin - Usuarios', 
                description: 'Administración completa de usuarios (Solo Admin)'
            },
            {
                name: 'Productos',
                description: 'Gestión del catálogo de productos agrícolas'
            },
            {
                name: 'Anuncios',
                description: 'Anuncios de compra y venta de productos'
            },
            {
                name: 'Pedidos',
                description: 'Gestión de pedidos y transacciones'
            },
            {
                name: 'Chat',
                description: 'Sistema de mensajería entre usuarios'
            },
            {
                name: 'Reputación',
                description: 'Sistema de calificaciones y comentarios'
            },
            {
                name: 'Favoritos',
                description: 'Productos y vendedores favoritos'
            },
            {
                name: 'Membresías',
                description: 'Planes premium para vendedores'
            },
            {
                name: 'Pagos QR',
                description: 'Códigos QR para pagos'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa tu token JWT aquí. Formato: Bearer <tu_token>'
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
    // CSS personalizado simple y profesional
    const customCss = `
        .swagger-ui .topbar { display: none; }
        .swagger-ui { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        }
        .swagger-ui .info { 
            margin: 30px 0; 
        }
        .swagger-ui .info .title {
            font-size: 28px;
            color: #3b4151;
            margin-bottom: 10px;
        }
        .swagger-ui .info .description {
            font-size: 14px;
            line-height: 1.5;
            color: #3b4151;
        }
        .swagger-ui .scheme-container {
            background: #fafafa;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #d3d3d3;
        }
        .swagger-ui .btn.authorize {
            background: #4990e2;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
        }
        .swagger-ui .btn.try-out {
            background: #61affe;
            color: white;
            border: 1px solid #61affe;
            border-radius: 4px;
        }
        .swagger-ui .opblock-tag {
            font-size: 18px;
            font-weight: 600;
            color: #3b4151;
            margin: 20px 0 10px 0;
        }
    `;
    
    const swaggerOptions = {
        customCss,
        customSiteTitle: 'EFresco API - Documentación',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            tagsSorter: 'alpha'
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
            mensaje: 'Bienvenido a EFresco API',
            documentacion: `${req.protocol}://${req.get('host')}/api-docs`,
            version: specs.info.version,
            endpoints_principales: {
                usuarios: '/api/usuarios',
                productos: '/api/productos', 
                admin: '/api/usuarios/admin',
                auth: '/api/usuarios/login'
            }
        });
    });
};

module.exports = swaggerSetup;