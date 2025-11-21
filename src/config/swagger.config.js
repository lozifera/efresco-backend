const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EFresco API',
            version: '1.0.0',
            description: 'API para plataforma de comercio agrícola B2B',
            contact: {
                name: 'EFresco Team',
                email: 'soporte@efresco.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3001}`,
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        id_usuario: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Juan' },
                        apellido: { type: 'string', example: 'Pérez' },
                        email: { type: 'string', example: 'juan@example.com' },
                        telefono: { type: 'string', example: '+591 70123456' },
                        direccion: { type: 'string', example: 'Av. Siempre Viva 123' },
                        verificado: { type: 'boolean', example: false },
                        fecha_registro: { type: 'string', format: 'date-time' }
                    }
                },
                Producto: {
                    type: 'object',
                    properties: {
                        id_producto: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Papa blanca' },
                        descripcion: { type: 'string', example: 'Papa de calidad premium' },
                        unidad_medida: { type: 'string', example: 'kg' },
                        precio_referencial: { type: 'number', example: 2.50 },
                        imagen_url: { type: 'string', example: 'https://example.com/papa.jpg' }
                    }
                },
                AnuncioVenta: {
                    type: 'object',
                    properties: {
                        id_anuncio: { type: 'integer', example: 1 },
                        cantidad: { type: 'number', example: 100 },
                        unidad: { type: 'string', example: 'kg' },
                        precio: { type: 'number', example: 250.00 },
                        descripcion: { type: 'string', example: 'Papa blanca de primera calidad' },
                        ubicacion: { type: 'string', example: 'La Paz, Bolivia' },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Mensaje de error' },
                        details: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJSDoc(options);

const swaggerSetup = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'EFresco API Documentation'
    }));
    
    // Endpoint para obtener el JSON de la especificación
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

module.exports = swaggerSetup;