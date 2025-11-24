# 🚨 SOLUCIÓN CORS EN RENDER - IMÁGENES

## 🔍 PROBLEMA
```
Access to fetch at 'https://efresco-backend.onrender.com/uploads/imagen.png' 
from origin 'http://localhost:4200' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

## ⚡ CAUSA
Render redirige automáticamente peticiones HTTP → HTTPS, y los navegadores **NO PERMITEN** redirecciones en peticiones preflight (OPTIONS).

## ✅ SOLUCIONES APLICADAS

### 1. 🛠️ Configuración CORS Específica para Render
- Headers CORS mejorados para dominios `.onrender.com`
- Manejo específico de peticiones preflight
- Prevención de redirecciones automáticas

### 2. 🔧 Middleware Anti-Redirección  
- Forzar HTTPS antes de redirecciones automáticas
- Manejo de trailing slash en rutas de archivos
- Headers específicos para Render

### 3. 📁 Archivo `render.yaml`
Configuración específica para Render con:
- Rutas de reescritura para `/uploads/*`
- Headers CORS personalizados
- Configuración de red para orígenes permitidos

## 🚀 PASOS PARA DEPLOYAR

### 1. Verificar Variables de Entorno en Render
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_secreto_jwt
DATABASE_URL=postgresql://...
```

### 2. Redesplegar en Render
1. Ve a tu dashboard de Render
2. Selecciona tu servicio `efresco-backend`
3. Click en "Manual Deploy" → "Deploy latest commit"
4. Espera 3-5 minutos

### 3. Verificar Funcionamiento
Prueba estas URLs:

**✅ Health Check:**
```
https://efresco-backend.onrender.com/health
```

**✅ Imagen de Prueba:**
```
https://efresco-backend.onrender.com/uploads/tu-imagen.png
```

**✅ CORS Preflight:**
```bash
curl -I -X OPTIONS https://efresco-backend.onrender.com/uploads/test.png \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET"
```

## 🔧 SI PERSISTE EL PROBLEMA

### Opción 1: URL Directa (Temporal)
En tu frontend Angular, usa directamente:
```typescript
// En lugar de fetch con CORS, usar directamente:
const imageUrl = 'https://efresco-backend.onrender.com/uploads/imagen.png';
```

### Opción 2: Proxy en Angular (Desarrollo)
Crear `proxy.conf.json`:
```json
{
  "/api/*": {
    "target": "https://efresco-backend.onrender.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Opción 3: CDN/Storage Externo
Considera migrar imágenes a:
- **Cloudinary** (recomendado)
- **AWS S3**
- **Google Cloud Storage**

## 📞 CONTACTO
Si el problema persiste después de redesplegar, revisar logs en:
```
Render Dashboard → efresco-backend → Logs
```

---
**⚠️ IMPORTANTE:** Este problema es específico de Render y su manejo de redirecciones HTTPS. Las configuraciones aplicadas deberían resolverlo completamente.