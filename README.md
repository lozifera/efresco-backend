# 🌱 EFresco Backend

**Marketplace agrícola completo desarrollado con Node.js, Express y PostgreSQL**

## ✨ Características Principales

🔐 **Autenticación y Autorización**
- JWT tokens seguros
- Sistema de roles (admin, cliente, productor)
- Recuperación de contraseña por email

🛒 **E-commerce Completo**
- Gestión de productos con imágenes
- Sistema de categorías
- Anuncios de compra/venta
- Carrito y pedidos

💬 **Comunicación**
- Chat en tiempo real
- Sistema de comentarios
- Reputación de usuarios

💰 **Pagos y Membresías**
- Integración QR de pagos
- Sistema de membresías premium
- Gestión de transacciones

📧 **Recuperación de Contraseñas**
- Tokens seguros con expiración
- Emails HTML profesionales
- Validaciones robustas

## 🚀 Tecnologías Utilizadas

- **Backend**: Node.js + Express 5.1.0
- **Base de Datos**: PostgreSQL + Sequelize ORM
- **Autenticación**: JWT + bcryptjs
- **Documentación**: Swagger/OpenAPI
- **Upload**: Multer (imágenes)
- **Email**: Nodemailer
- **Seguridad**: Helmet, CORS, Rate Limiting

## 📊 Estructura de Base de Datos

**18 tablas relacionales:**
- Usuarios y roles
- Productos y categorías  
- Pedidos y pagos
- Chat y mensajes
- Comentarios y reputación
- Membresías y favoritos

## 🔧 Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/efresco-backend.git
cd efresco-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Inicializar base de datos
npm run init:prod

# Iniciar servidor
npm run dev
```

## 🌐 Deploy en Render

Este proyecto está optimizado para deployment en Render:

1. Fork este repositorio
2. Crear Web Service en Render conectado al repo
3. Configurar variables de entorno en Render
4. ¡Deploy automático!

Ver guía completa en `DEPLOY_RENDER_GUIDE.md`

## 📚 Documentación API

- **Swagger UI**: `/api/docs`
- **Endpoints**: 50+ endpoints REST
- **Autenticación**: Bearer tokens
- **Validación**: express-validator

## 🔐 Credenciales por Defecto

```
Admin: admin@efresco.com / efresco2024
Productor: productor@efresco.com / productor123
```

## 🚀 Scripts Disponibles

```bash
npm start          # Producción
npm run dev        # Desarrollo con watch
npm run init:prod  # Inicializar BD producción
```

## 🛡️ Seguridad

- Contraseñas hasheadas (bcrypt)
- Tokens JWT seguros
- Rate limiting implementado
- Validación de datos robusta
- CORS configurado
- Helmet para headers seguros

## 📁 Estructura del Proyecto

```
src/
├── controllers/     # Lógica de negocio
├── models/         # Modelos de Sequelize
├── routes/         # Definición de rutas
├── middlewares/    # Middlewares personalizados
├── services/       # Servicios (email, etc)
├── utils/          # Utilidades y helpers
├── config/         # Configuración BD y Swagger
└── public/         # Archivos estáticos
```

## 🔄 Estado del Proyecto

✅ **Completado**
- Sistema de autenticación
- CRUD completo de productos
- Upload de imágenes
- Chat y mensajería
- Sistema de pagos QR
- Recuperación de contraseñas
- Documentación Swagger

🚧 **En desarrollo**
- Notificaciones push
- Analytics dashboard
- Mobile API optimizations

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo `LICENSE` para detalles.

---

**🌱 EFresco - Conectando el campo con tu mesa** 🚀