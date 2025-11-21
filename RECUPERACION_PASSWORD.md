# 📧 Configuración del Sistema de Recuperación de Contraseñas

## 🔧 Configuración de Gmail (Recomendado)

### Paso 1: Habilitar 2FA en Gmail
1. Ve a tu cuenta de Google → Seguridad
2. Activa la verificación en 2 pasos

### Paso 2: Generar App Password
1. En Google → Seguridad → Contraseñas de aplicaciones
2. Selecciona "Correo" y "Windows"  
3. Copia la contraseña generada (16 caracteres)

### Paso 3: Configurar .env
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App Password de Gmail
FRONTEND_URL=http://localhost:3000
```

## 🚀 Configuración Alternativa (Outlook/Hotmail)

```env
# En email.service.js, descomentar y configurar:
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
EMAIL_USER=tu_email@outlook.com
EMAIL_PASS=tu_contraseña
```

## 📋 Endpoints Disponibles

### 1. Solicitar Recuperación
```
POST /api/usuarios/recuperar-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta:**
```json
{
  "mensaje": "Si el email existe, se enviará un correo de recuperación"
}
```

### 2. Verificar Token
```
POST /api/usuarios/verificar-token
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6..."
}
```

**Respuesta:**
```json
{
  "mensaje": "Token válido",
  "token_valido": true
}
```

### 3. Restablecer Contraseña
```
POST /api/usuarios/restablecer-password
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6...",
  "nueva_password": "nuevaContraseña123"
}
```

**Respuesta:**
```json
{
  "mensaje": "Contraseña restablecida exitosamente"
}
```

## 🔒 Características de Seguridad

### ✅ Implementadas
- **Tokens únicos**: UUID + timestamp + random bytes
- **Hash seguro**: SHA-256 para tokens, SHA-512 para almacenamiento
- **Expiración**: 15 minutos por defecto
- **Timing-safe comparison**: Previene ataques de timing
- **Rate limiting**: Evita spam de solicitudes
- **Email enumeration protection**: No revela si email existe
- **Token único uso**: Se elimina después de usar

### 🛡️ Validaciones
- Contraseñas mínimo 8 caracteres
- Emails válidos (formato)
- Tokens no vacíos
- Verificación de expiración
- Cuentas activas únicamente

## 🧹 Limpieza Automática

El sistema incluye función para limpiar tokens expirados:

```javascript
// Ejecutar periódicamente (cron job recomendado)
await TokenUtils.limpiarTokensExpirados(Usuario);
```

## 📱 Frontend - Ejemplo de Implementación

### HTML Form
```html
<!-- Solicitar recuperación -->
<form id="forgot-password-form">
  <input type="email" id="email" placeholder="Tu email" required>
  <button type="submit">Recuperar contraseña</button>
</form>

<!-- Restablecer contraseña -->
<form id="reset-password-form">
  <input type="hidden" id="token" value="">
  <input type="password" id="nueva_password" placeholder="Nueva contraseña" required>
  <button type="submit">Cambiar contraseña</button>
</form>
```

### JavaScript
```javascript
// Solicitar recuperación
document.getElementById('forgot-password-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  
  const response = await fetch('/api/usuarios/recuperar-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  alert(data.mensaje);
};

// Restablecer contraseña
document.getElementById('reset-password-form').onsubmit = async (e) => {
  e.preventDefault();
  const token = document.getElementById('token').value;
  const nueva_password = document.getElementById('nueva_password').value;
  
  const response = await fetch('/api/usuarios/restablecer-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nueva_password })
  });
  
  const data = await response.json();
  alert(data.mensaje);
};

// Verificar token al cargar página reset-password
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  document.getElementById('token').value = token;
  
  // Verificar token
  fetch('/api/usuarios/verificar-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  }).then(response => response.json())
    .then(data => {
      if (!data.token_valido) {
        alert('Token inválido o expirado');
        window.location.href = '/login';
      }
    });
}
```

## 🧪 Pruebas en Postman

### Collection: Recuperación de Contraseñas

1. **Solicitar Recuperación**
   - Method: POST
   - URL: `{{base_url}}/api/usuarios/recuperar-password`
   - Body: `{"email": "test@ejemplo.com"}`

2. **Verificar Token** 
   - Method: POST
   - URL: `{{base_url}}/api/usuarios/verificar-token`
   - Body: `{"token": "token_del_email"}`

3. **Restablecer Password**
   - Method: POST  
   - URL: `{{base_url}}/api/usuarios/restablecer-password`
   - Body: `{"token": "token_del_email", "nueva_password": "nuevaPassword123"}`

## ⚠️ Consideraciones de Producción

1. **Rate Limiting**: Limitar solicitudes por IP
2. **Logs**: Monitorear intentos de recuperación  
3. **HTTPS**: Obligatorio en producción
4. **CORS**: Configurar dominios permitidos
5. **Backup**: Configurar respaldo de BD
6. **Monitoring**: Alertas por fallos de email

## 🎯 Próximas Mejoras Opcionales

- [ ] Verificación por SMS
- [ ] Preguntas de seguridad
- [ ] Notificaciones de cambio de contraseña
- [ ] Historial de contraseñas
- [ ] Bloqueo por intentos fallidos