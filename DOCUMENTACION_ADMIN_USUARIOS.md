# 📋 **ENDPOINTS DE ADMINISTRACIÓN DE USUARIOS - EFRESCO**

## 🔑 **AUTENTICACIÓN REQUERIDA**
Todos los endpoints de administración requieren:
- **Header**: `Authorization: Bearer <token>`
- **Rol**: `administrador`

---

## 📍 **ENDPOINTS DISPONIBLES**

### 1. **📋 LISTAR TODOS LOS USUARIOS**
```
GET /api/usuarios/
```

**Parámetros de query:**
```json
{
  "page": 1,        // Número de página (opcional, default: 1)
  "limit": 10       // Cantidad por página (opcional, default: 10)
}
```

**Respuesta exitosa (200):**
```json
{
  "usuarios": [
    {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@ejemplo.com",
      "telefono": "+591 70123456",
      "direccion": "Av. Siempreviva 123",
      "verificado": true,
      "estado": true,
      "fecha_registro": "2024-01-15T10:30:00.000Z",
      "foto_perfil_url": "https://res.cloudinary.com/...",
      "roles": ["cliente"]
    }
  ],
  "paginacion": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 2. **👤 OBTENER USUARIO ESPECÍFICO**
```
GET /api/usuarios/admin/{id}
```

**Ejemplo:**
```
GET /api/usuarios/admin/5
```

**Respuesta exitosa (200):**
```json
{
  "id_usuario": 5,
  "nombre": "María",
  "apellido": "García",
  "email": "maria@ejemplo.com",
  "telefono": "+591 71234567",
  "direccion": "Calle Las Flores 456",
  "ubicacion_lat": -17.7833,
  "ubicacion_lng": -63.1821,
  "verificado": false,
  "estado": true,
  "fecha_registro": "2024-01-20T14:15:00.000Z",
  "foto_perfil_url": null,
  "roles": ["cliente", "vendedor"]
}
```

**Errores:**
- `404`: Usuario no encontrado

---

### 3. **✏️ ACTUALIZAR USUARIO COMPLETO (PUT)**
```
PUT /api/usuarios/admin/{id}
```

**Body de ejemplo:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez Mendoza",
  "email": "juancarlos@ejemplo.com",
  "telefono": "+591 70123456",
  "direccion": "Av. Siempreviva 123, Zona Norte",
  "ubicacion_lat": -17.7833,
  "ubicacion_lng": -63.1821,
  "verificado": true,
  "estado": true
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario actualizado exitosamente",
  "usuario": {
    "id_usuario": 5,
    "nombre": "Juan Carlos",
    "apellido": "Pérez Mendoza",
    "email": "juancarlos@ejemplo.com",
    "telefono": "+591 70123456",
    "direccion": "Av. Siempreviva 123, Zona Norte",
    "ubicacion_lat": -17.7833,
    "ubicacion_lng": -63.1821,
    "verificado": true,
    "estado": true,
    "fecha_registro": "2024-01-20T14:15:00.000Z",
    "roles": ["cliente", "vendedor"]
  }
}
```

**Errores:**
- `400`: Email ya existe en otro usuario
- `404`: Usuario no encontrado

---

### 4. **🔄 CAMBIAR ESTADO/VERIFICACIÓN (PATCH)**
```
PATCH /api/usuarios/admin/{id}
```

**Ejemplos de uso:**

**Verificar usuario:**
```json
{
  "verificado": true
}
```

**Desactivar usuario:**
```json
{
  "estado": false
}
```

**Cambiar ambos:**
```json
{
  "verificado": true,
  "estado": true
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Estado actualizado exitosamente",
  "usuario": {
    "id_usuario": 5,
    "verificado": true,
    "estado": true
  }
}
```

**Errores:**
- `400`: Debe proporcionar al menos un campo (verificado o estado)
- `404`: Usuario no encontrado

---

### 5. **🗑️ ELIMINAR USUARIO**
```
DELETE /api/usuarios/admin/{id}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Usuario eliminado exitosamente"
}
```

**Error si tiene datos relacionados (409):**
```json
{
  "error": "No se puede eliminar el usuario porque tiene datos relacionados",
  "detalles": {
    "productos": 5,
    "pedidos": 12,
    "chats": 3
  },
  "sugerencia": "Considere desactivar el usuario en lugar de eliminarlo"
}
```

**Errores:**
- `404`: Usuario no encontrado
- `409`: Tiene datos relacionados (productos, pedidos, chats)

---

## 🚀 **EJEMPLOS DE USO CON JAVASCRIPT**

### **Obtener lista de usuarios:**
```javascript
const response = await fetch('/api/usuarios/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Usuarios:', data.usuarios);
```

### **Verificar un usuario:**
```javascript
const response = await fetch('/api/usuarios/admin/5', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    verificado: true
  })
});

const result = await response.json();
console.log(result.mensaje);
```

### **Desactivar un usuario:**
```javascript
const response = await fetch('/api/usuarios/admin/5', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: false
  })
});

const result = await response.json();
console.log(result.mensaje);
```

### **Actualizar información completa:**
```javascript
const response = await fetch('/api/usuarios/admin/5', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: "Nuevo Nombre",
    apellido: "Nuevo Apellido",
    email: "nuevo@email.com",
    telefono: "+591 70000000",
    verificado: true,
    estado: true
  })
});

const result = await response.json();
console.log('Usuario actualizado:', result.usuario);
```

---

## 📊 **ESTADOS DEL USUARIO**

### **Campo `verificado`:**
- `true`: Usuario verificado (puede realizar todas las acciones)
- `false`: Usuario pendiente de verificación (limitaciones en funcionalidades)

### **Campo `estado`:**
- `true`: Usuario activo (cuenta habilitada)
- `false`: Usuario desactivado (no puede iniciar sesión)

---

## 🔐 **CÓDIGOS DE RESPUESTA**

| Código | Descripción |
|--------|-------------|
| `200` | ✅ Operación exitosa |
| `400` | ❌ Datos inválidos o faltantes |
| `401` | 🔒 Token inválido o faltante |
| `403` | 🚫 Sin permisos de administrador |
| `404` | 🔍 Usuario no encontrado |
| `409` | ⚠️ Conflicto (no se puede eliminar) |
| `500` | 💥 Error interno del servidor |

---

## 📝 **NOTAS IMPORTANTES**

1. **Eliminación vs Desactivación:** Se recomienda desactivar usuarios (`estado: false`) en lugar de eliminarlos para mantener la integridad de datos.

2. **Verificación:** Los usuarios no verificados pueden tener limitaciones en ciertas funcionalidades del sistema.

3. **Paginación:** La lista de usuarios está paginada para mejorar el rendimiento.

4. **Validaciones:** El email debe ser único en todo el sistema.

5. **Relaciones:** Antes de eliminar, el sistema verifica si el usuario tiene productos, pedidos o chats asociados.

---

## 🎯 **ENDPOINTS FALTANTES AGREGADOS**

✅ **GET /api/usuarios/admin/{id}** - Obtener usuario específico para admin
✅ **PUT /api/usuarios/admin/{id}** - Actualizar usuario completo
✅ **PATCH /api/usuarios/admin/{id}** - Cambiar estado/verificación (¡Más fácil!)
✅ **DELETE /api/usuarios/admin/{id}** - Eliminar usuario

El **PATCH** es mucho más fácil y rápido para cambios simples como verificar usuarios o activar/desactivar cuentas.