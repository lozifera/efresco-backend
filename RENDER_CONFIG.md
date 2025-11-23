# 🚨 CONFIGURACIÓN RENDER - VARIABLES DE ENTORNO

## 📋 VARIABLES REQUERIDAS EN RENDER

### En tu Web Service → Environment, agregar:

```env
NODE_ENV=production
JWT_SECRET=efresco_jwt_secreto_super_seguro_produccion_2024_render_v1
PORT=10000
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_gmail
FRONTEND_URL=https://tu-frontend-futuro.com
```

### DATABASE_URL (después de crear PostgreSQL):
```env
DATABASE_URL=postgresql://usuario:password@host:port/database_name
```

## ⚙️ BUILD SETTINGS

```
Build Command: npm install
Start Command: npm start
Environment: Node
Branch: main
Auto-Deploy: Yes
```

## 🔍 TROUBLESHOOTING

### Error 404:
1. ✅ Crear PostgreSQL database
2. ✅ Configurar DATABASE_URL
3. ✅ Agregar todas las variables de entorno
4. ✅ Manual redeploy
5. ✅ Esperar 5-10 minutos

### Ver Logs:
Dashboard → efresco-backend → Logs

### URLs de Testing:
- Health: https://tu-app.onrender.com/
- Docs: https://tu-app.onrender.com/api/docs
- Login: POST https://tu-app.onrender.com/api/usuarios/login