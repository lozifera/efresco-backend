# Endpoints de Productos para Administradores - eFresco Backend

## Resumen
Este documento detalla todos los endpoints específicos de productos disponibles para usuarios con rol de **administrador** en el sistema eFresco.

**Base URL:** `https://efresco-backend.onrender.com/api/productos`

## Endpoints Específicos para Administradores

### 1. 📝 Crear Producto (POST)
- **Endpoint:** `POST /api/productos`
- **Autenticación:** JWT Token requerido
- **Rol:** Administrador únicamente
- **Descripción:** Crea un nuevo producto en el sistema

#### Headers Requeridos:
```json
{
  "Authorization": "Bearer <token_jwt>",
  "Content-Type": "application/json"
}
```

#### Cuerpo de la Petición:
```json
{
  "nombre": "Papa Blanca Premium",
  "descripcion": "Papa blanca de primera calidad, ideal para todo tipo de preparaciones culinarias",
  "precio": 3.50,
  "unidad": "kg",
  "disponible": true,
  "cantidad_disponible": 100,
  "vendedor_id": 2,
  "categoria_id": 1
}
```

#### Ejemplo de Respuesta (201):
```json
{
  "mensaje": "Producto creado exitosamente",
  "producto": {
    "id": 15,
    "nombre": "Papa Blanca Premium",
    "descripcion": "Papa blanca de primera calidad, ideal para todo tipo de preparaciones culinarias",
    "precio": "3.50",
    "unidad": "kg",
    "disponible": true,
    "cantidad_disponible": 100,
    "vendedor_id": 2,
    "categoria_id": 1,
    "fecha_creacion": "2024-01-15T10:30:00.000Z",
    "fecha_actualizacion": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. ✏️ Actualizar Producto (PUT)
- **Endpoint:** `PUT /api/productos/:id`
- **Autenticación:** JWT Token requerido
- **Rol:** Administrador únicamente
- **Descripción:** Actualiza completamente un producto existente

#### Headers Requeridos:
```json
{
  "Authorization": "Bearer <token_jwt>",
  "Content-Type": "application/json"
}
```

#### Parámetros de URL:
- `id`: ID del producto a actualizar

#### Cuerpo de la Petición:
```json
{
  "nombre": "Papa Blanca Premium Actualizada",
  "descripcion": "Papa blanca de primera calidad, seleccionada especialmente",
  "precio": 4.00,
  "unidad": "kg",
  "disponible": true,
  "cantidad_disponible": 150,
  "vendedor_id": 2,
  "categoria_id": 1
}
```

#### Ejemplo de Respuesta (200):
```json
{
  "mensaje": "Producto actualizado exitosamente",
  "producto": {
    "id": 15,
    "nombre": "Papa Blanca Premium Actualizada",
    "descripcion": "Papa blanca de primera calidad, seleccionada especialmente",
    "precio": "4.00",
    "unidad": "kg",
    "disponible": true,
    "cantidad_disponible": 150,
    "vendedor_id": 2,
    "categoria_id": 1,
    "fecha_creacion": "2024-01-15T10:30:00.000Z",
    "fecha_actualizacion": "2024-01-15T14:45:00.000Z"
  }
}
```

---

### 3. 🗑️ Eliminar Producto (DELETE)
- **Endpoint:** `DELETE /api/productos/:id`
- **Autenticación:** JWT Token requerido
- **Rol:** Administrador únicamente
- **Descripción:** Elimina permanentemente un producto del sistema

#### Headers Requeridos:
```json
{
  "Authorization": "Bearer <token_jwt>"
}
```

#### Parámetros de URL:
- `id`: ID del producto a eliminar

#### Ejemplo de Respuesta (200):
```json
{
  "mensaje": "Producto eliminado exitosamente"
}
```

---

### 4. 🖼️ Subir Imagen de Producto (POST)
- **Endpoint:** `POST /api/productos/:id/imagen`
- **Autenticación:** JWT Token requerido
- **Rol:** Administrador únicamente
- **Descripción:** Sube una imagen para el producto especificado

#### Headers Requeridos:
```json
{
  "Authorization": "Bearer <token_jwt>",
  "Content-Type": "multipart/form-data"
}
```

#### Parámetros de URL:
- `id`: ID del producto

#### Form Data:
- `imagen`: Archivo de imagen (JPG, PNG, WEBP)
- Tamaño máximo: 5MB

#### Ejemplo de Respuesta (200):
```json
{
  "mensaje": "Imagen subida exitosamente",
  "imagen_url": "https://res.cloudinary.com/dvyf4apyu/image/upload/v1705234567/productos/producto_15_abc123.jpg"
}
```

---

### 5. 🗑️ Eliminar Imagen de Producto (DELETE)
- **Endpoint:** `DELETE /api/productos/:id/imagen`
- **Autenticación:** JWT Token requerido
- **Rol:** Administrador únicamente
- **Descripción:** Elimina la imagen del producto especificado

#### Headers Requeridos:
```json
{
  "Authorization": "Bearer <token_jwt>"
}
```

#### Parámetros de URL:
- `id`: ID del producto

#### Ejemplo de Respuesta (200):
```json
{
  "mensaje": "Imagen eliminada exitosamente"
}
```

---

## Endpoints Públicos (Sin Restricción de Administrador)

### 📋 Listar Productos
- **Endpoint:** `GET /api/productos`
- **Autenticación:** No requerida
- **Descripción:** Lista todos los productos con filtros opcionales

### 👁️ Obtener Producto Individual
- **Endpoint:** `GET /api/productos/:id`
- **Autenticación:** No requerida
- **Descripción:** Obtiene los detalles de un producto específico

---

## Códigos de Error Comunes

### 🚫 Error 401 - No Autorizado
```json
{
  "error": "Token no proporcionado",
  "codigo": 401
}
```

### 🔒 Error 403 - Sin Permisos
```json
{
  "error": "Acceso denegado. Se requiere rol de administrador",
  "codigo": 403
}
```

### 🔍 Error 404 - Producto No Encontrado
```json
{
  "error": "Producto no encontrado",
  "codigo": 404
}
```

### ⚠️ Error 400 - Datos Inválidos
```json
{
  "error": "Datos de entrada inválidos",
  "detalles": [
    {
      "campo": "precio",
      "mensaje": "El precio debe ser un número positivo"
    }
  ],
  "codigo": 400
}
```

### 🖼️ Error 400 - Imagen Inválida
```json
{
  "error": "No se proporcionó archivo de imagen",
  "codigo": 400
}
```

---

## Validaciones de Campos

### Crear/Actualizar Producto:
- **nombre**: Requerido, string, máximo 100 caracteres
- **descripcion**: Opcional, string, máximo 500 caracteres
- **precio**: Requerido, número positivo, máximo 2 decimales
- **unidad**: Requerido, string (ej: "kg", "unidad", "litro")
- **disponible**: Requerido, boolean
- **cantidad_disponible**: Requerido, número entero positivo
- **vendedor_id**: Requerido, ID de usuario existente con rol vendedor
- **categoria_id**: Requerido, ID de categoría existente

### Subir Imagen:
- **Formatos aceptados**: JPG, JPEG, PNG, WEBP
- **Tamaño máximo**: 5MB
- **Campo requerido**: "imagen" en form-data

---

## Notas Importantes

1. **Autenticación Obligatoria**: Todos los endpoints de administrador requieren JWT token válido
2. **Rol Administrador**: Solo usuarios con rol "administrador" pueden acceder a estos endpoints
3. **Validación de Datos**: Todos los campos se validan según las reglas definidas
4. **Gestión de Imágenes**: Las imágenes se almacenan en Cloudinary y se optimizan automáticamente
5. **Relaciones**: Los productos están relacionados con vendedores y categorías que deben existir previamente

## Swagger UI
Puedes probar todos estos endpoints en la documentación interactiva:
**URL:** `https://efresco-backend.onrender.com/api-docs`

---

*Documentación generada para eFresco Backend API v1.0*
*Última actualización: Enero 2024*