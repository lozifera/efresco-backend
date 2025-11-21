# 🚀 **GUÍA COMPLETA PARA SUBIR EFRESCO BACKEND A RENDER** 

## 📋 **PASO A PASO - RENDER DEPLOYMENT**

### 🎯 **1. PREPARAR PROYECTO PARA PRODUCCIÓN**

#### ✅ **Archivos ya configurados:**
- ✅ `package.json` → Script `start` corregido
- ✅ `.gitignore` → Archivos sensibles excluidos
- ✅ `.env` → Variables preparadas
- ✅ Estructura completa del proyecto

---

### 🌐 **2. CREAR REPOSITORIO EN GITHUB**

#### **Opción A: Desde VS Code (Recomendado)**
1. Abrir terminal en VS Code
2. Ejecutar comandos:

```bash
git init
git add .
git commit -m "🚀 EFresco Backend - Sistema completo con recuperación de contraseñas"
```

3. Ir a GitHub.com → New Repository
4. Nombre: `efresco-backend`
5. Descripción: `Backend completo para marketplace agrícola EFresco`
6. ✅ Public o Private (tu elección)
7. ❌ NO marcar README, .gitignore, license (ya los tienes)

8. Copiar comandos de GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/efresco-backend.git
git branch -M main
git push -u origin main
```

#### **Opción B: GitHub Desktop**
- Instalar GitHub Desktop
- Add existing repository
- Publish to GitHub

---

### 🎁 **3. CONFIGURAR RENDER**

#### **3.1 Crear cuenta en Render**
- Ir a [render.com](https://render.com)
- Registrarse con GitHub (GRATIS)

#### **3.2 Crear Web Service**
1. **Dashboard** → **New** → **Web Service**
2. **Connect GitHub** → Autorizar Render
3. **Seleccionar repositorio**: `efresco-backend`
4. **Configuración:**

```
Name: efresco-backend
Region: Oregon (US West)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### **3.3 Plan de servicio**
- ✅ **Free Plan** (0$/mes)
- ⚠️ Limitaciones: Se duerme después de inactividad
- 💡 Para producción real considerar plan pagado

---

### 🗄️ **4. CONFIGURAR BASE DE DATOS POSTGRESQL**

#### **4.1 Crear PostgreSQL en Render**
1. **Dashboard** → **New** → **PostgreSQL**
2. **Configuración:**
```
Name: efresco-database
Region: Oregon (US West) 
PostgreSQL Version: 15
```
3. **Plan**: ✅ **Free** (90 días gratis, luego $7/mes)

#### **4.2 Obtener credenciales**
Render te dará automáticamente:
- **External Database URL**: `postgresql://usuario:password@host:port/database`
- **Internal Database URL**: Para conexión desde tu app

---

### ⚙️ **5. CONFIGURAR VARIABLES DE ENTORNO**

En tu **Web Service** → **Environment**:

```env
# Base de datos (usar External Database URL de PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host:port/database

# O separado:
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=efresco_database_xxxx
DB_USER=efresco_database_user
DB_PASSWORD=password_generado

# Aplicación
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_jwt_secreto_super_seguro_para_produccion_2024

# Email (configurar con tus credenciales reales)
EMAIL_USER=tu_email_real@gmail.com
EMAIL_PASS=tu_app_password_real

# Frontend URL (cuando tengas frontend deployado)
FRONTEND_URL=https://tu-frontend.netlify.app
```

---

### 📊 **6. MODIFICAR CONFIGURACIÓN DE BASE DE DATOS**

Actualizar `src/config/db.config.js` para producción:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
    // Render proporciona DATABASE_URL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Desarrollo local
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: console.log
        }
    );
}

module.exports = sequelize;
```

---

### 🚀 **7. DEPLOY AUTOMÁTICO**

#### **Render hace deploy automático cuando:**
- ✅ Push a rama `main`
- ✅ Cambios en código
- ✅ Variables de entorno actualizadas

#### **Proceso de deploy:**
1. **Build**: `npm install`
2. **Start**: `npm start`
3. **Health Check**: Render verifica que responda
4. **Live**: URL pública disponible

---

### 📱 **8. URLS FINALES**

Render te dará URLs como:
- **Backend API**: `https://efresco-backend.onrender.com`
- **Base de datos**: Acceso interno automático

#### **Endpoints disponibles:**
```
GET  https://efresco-backend.onrender.com/api/docs       # Swagger
POST https://efresco-backend.onrender.com/api/usuarios/registro
POST https://efresco-backend.onrender.com/api/usuarios/login
POST https://efresco-backend.onrender.com/api/usuarios/recuperar-password
GET  https://efresco-backend.onrender.com/api/productos
... todos tus endpoints
```

---

### 🔧 **9. INICIALIZAR BASE DE DATOS EN PRODUCCIÓN**

Crear script de inicialización:

```javascript
// scripts/init-production.js
const sequelize = require('../src/config/db.config');
const models = require('../src/models');

async function initProduction() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');
        
        await sequelize.sync({ force: false });
        console.log('✅ Tablas sincronizadas');
        
        // Crear admin por defecto
        const { Usuario, Rol, UsuarioRol } = models;
        
        // Crear roles si no existen
        await Rol.findOrCreate({
            where: { nombre: 'administrador' },
            defaults: { descripcion: 'Administrador del sistema' }
        });
        
        // Crear admin
        const adminExiste = await Usuario.findOne({ 
            where: { email: 'admin@efresco.com' } 
        });
        
        if (!adminExiste) {
            const bcrypt = require('bcryptjs');
            const passwordHash = await bcrypt.hash('admin123', 12);
            
            const admin = await Usuario.create({
                nombre: 'Administrador',
                apellido: 'EFresco',
                email: 'admin@efresco.com',
                password_hash: passwordHash
            });
            
            const rolAdmin = await Rol.findOne({ where: { nombre: 'administrador' } });
            await UsuarioRol.create({
                id_usuario: admin.id_usuario,
                id_rol: rolAdmin.id_rol
            });
            
            console.log('✅ Admin creado: admin@efresco.com / admin123');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

initProduction();
```

---

### ⚡ **10. COMANDOS RÁPIDOS**

#### **Deploy inicial:**
```bash
# En tu proyecto local
git add .
git commit -m "🚀 Deploy to Render"
git push origin main
```

#### **Updates posteriores:**
```bash
git add .
git commit -m "✨ Nueva funcionalidad"
git push origin main
# Render hace deploy automático
```

---

### 🎯 **11. VERIFICAR DEPLOYMENT**

#### **Checklist post-deploy:**
- [ ] ✅ Build exitoso en Render
- [ ] ✅ Service corriendo (green status)
- [ ] ✅ Base de datos conectada
- [ ] ✅ Swagger accesible: `/api/docs`
- [ ] ✅ Endpoints respondiendo
- [ ] ✅ Variables de entorno configuradas

#### **Test rápido:**
```bash
# Verificar que API responde
curl https://tu-app.onrender.com/api/docs

# Test de login
curl -X POST https://tu-app.onrender.com/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@efresco.com","password":"admin123"}'
```

---

### 💡 **12. TIPS IMPORTANTES**

#### ⚠️ **Plan Gratuito:**
- App se duerme después de 15 min de inactividad
- Primer request después puede tardar 30-60 segundos
- 750 horas/mes de runtime

#### 🚀 **Para Producción Real:**
- Considerar plan Starter ($7/mes)
- App siempre activa
- SSL automático
- Backups automáticos

#### 🔒 **Seguridad:**
- Cambiar JWT_SECRET en producción
- Usar contraseñas fuertes
- Configurar CORS apropiadamente
- Habilitar rate limiting

---

### 🎉 **¡LISTO! TU BACKEND ESTARÁ LIVE EN INTERNET** 🌍

Con estos pasos tendrás tu backend EFresco completo funcionando en Render, accesible desde cualquier parte del mundo, con base de datos PostgreSQL y todas las funcionalidades implementadas.

**URLs finales serán algo como:**
- API: `https://efresco-backend-abc123.onrender.com`
- Docs: `https://efresco-backend-abc123.onrender.com/api/docs`