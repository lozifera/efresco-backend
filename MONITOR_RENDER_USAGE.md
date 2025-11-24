# 📊 MONITOREO DE USO DE RENDER

## 🚨 LÍMITES CRÍTICOS A VIGILAR

### **1. PLAN GRATUITO - WEB SERVICE**
- ✅ **750 horas gratis/mes** (suficiente para 24/7)
- ⚠️ **Se duerme tras 15 min sin tráfico**
- 🔒 **512 MB RAM** - NO exceder
- 🔒 **0.1 CPU cores**

### **2. PLAN GRATUITO - POSTGRESQL** 
- 🚨 **SOLO 90 DÍAS GRATIS** (después $7/mes)
- 🔒 **1 GB almacenamiento**
- 🔒 **100 conexiones simultáneas**

## 📈 CÓMO VERIFICAR TU USO

### **Dashboard de Render:**
1. Ve a: https://dashboard.render.com
2. **Tu Web Service** → **Metrics** tab:
   - 📊 CPU Usage
   - 📊 Memory Usage  
   - 📊 Request Count
   - 📊 Response Time

3. **PostgreSQL** → **Metrics**:
   - 💾 Storage Used
   - 🔗 Active Connections
   - ⏰ Días restantes gratis

## ⚠️ SEÑALES DE ALERTA

### **COSTOS INESPERADOS:**
```
❌ PostgreSQL > 90 días = $7/mes automático
❌ Web Service > 750h/mes = $7/mes  
❌ RAM > 512MB = upgrade forzado
❌ Storage > 1GB = upgrade forzado
```

## 🛡️ OPTIMIZACIONES PARA NO PAGAR

### **1. Rate Limiting (YA IMPLEMENTADO ✅):**
```javascript
// Tu configuración actual: 100 requests/15min por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
});
```

### **2. Optimizar Base de Datos:**
- 🔍 **Limitar registros**: LIMIT en queries
- 🧹 **Limpiar logs viejos** regularmente
- 📦 **Comprimir imágenes** antes de subir

### **3. Minimizar Cold Starts:**
- 🔄 **Ping automático** cada 10 minutos
- ⚡ **Cachear datos** frecuentes
- 🚀 **Respuestas rápidas** (< 30s timeout)

## 📱 HERRAMIENTAS DE MONITOREO

### **1. Uptime Monitoring (GRATIS):**
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- ⏰ Ping cada 5 min = mantiene activo

### **2. Alertas por Email:**
- 📧 Render envía alertas automáticas
- ⚠️ Configurar en: Dashboard → Notifications

## 🔢 CÁLCULO DE REQUESTS/MES

```
Tu límite actual:
- 100 requests / 15 min por IP
- = 400 requests/hora por IP  
- = 9,600 requests/día por IP
- = ~288,000 requests/mes por IP

Con 10 IPs diferentes = 2.88M requests/mes GRATIS
```

## 🎯 RECOMENDACIONES PARA DESARROLLO

### **FRONTEND (Desarrollo local):**
```javascript
// Usar localhost para desarrollo
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-app.onrender.com/api'
  : 'http://localhost:3001/api';  // ← Para pruebas locales
```

### **Testing Inteligente:**
1. 🏠 **Desarrollo local**: npm run dev  
2. 🧪 **Testing limitado** en producción
3. 📊 **Batch requests** cuando sea posible
4. ⚡ **Cache en frontend** para evitar requests repetidos

## ⏰ FECHAS CRÍTICAS

```
📅 VIGILAR CADA MES:
- Día 1: Reseteo de 750 horas
- Día 15: Revisar uso PostgreSQL  
- Día 85: ¡CRÍTICO! 5 días antes del cobro DB

🚨 ACCIÓN NECESARIA DÍA 85:
- Backup completo de la DB
- Evaluar migrar a otro servicio gratuito
- O preparar $7/mes para continuar
```

## 🆘 PLAN DE EMERGENCIA

### **Si Excedes Límites:**
1. **Inmediatamente**: Pausa el servicio
2. **Revisa**: Dashboard metrics
3. **Optimiza**: Queries y rate limits  
4. **Considera**: Migrar a Railway/Neon (gratuitos)

### **Alternativas Gratuitas:**
- **Railway**: 500h/mes + PostgreSQL gratis
- **Neon**: PostgreSQL gratis permanente  
- **Vercel**: Solo frontend/serverless
- **Supabase**: PostgreSQL + backend gratis