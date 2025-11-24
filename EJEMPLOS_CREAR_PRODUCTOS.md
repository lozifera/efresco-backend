# 🌱 **EJEMPLOS COMPLETOS PARA CREAR PRODUCTOS - EFRESCO**

## 📋 **3 EJEMPLOS LISTOS PARA USAR**

### **1. 🥔 Papa Blanca Premium**
```json
{
  "nombre": "Papa Blanca Premium",
  "descripcion": "Papa blanca de primera calidad, cosechada en tierras altas de La Paz. Ideal para todo tipo de preparaciones culinarias. Tamaño uniforme y excelente sabor.",
  "unidad_medida": "kg",
  "precio_referencial": 3.50,
  "imagen_url": "https://res.cloudinary.com/efresco/image/upload/v123/productos/papa_blanca_premium.jpg",
  "categorias": [1, 3]
}
```

**Detalles:**
- **Producto:** Papa de consumo directo
- **Precio:** 3.50 Bs por kilogramo
- **Categorías:** [1] Tubérculos, [3] Productos Premium

---

### **2. 🍅 Tomate Cherry Orgánico**
```json
{
  "nombre": "Tomate Cherry Orgánico",
  "descripcion": "Tomates cherry cultivados orgánicamente sin pesticidas. Perfectos para ensaladas, decoración de platos y snacks saludables. Dulces y jugosos.",
  "unidad_medida": "kg",
  "precio_referencial": 12.00,
  "imagen_url": "https://res.cloudinary.com/efresco/image/upload/v123/productos/tomate_cherry_organico.jpg",
  "categorias": [2, 4]
}
```

**Detalles:**
- **Producto:** Tomate cherry orgánico
- **Precio:** 12.00 Bs por kilogramo
- **Categorías:** [2] Hortalizas, [4] Productos Orgánicos

---

### **3. 🌾 Quinua Real Boliviana**
```json
{
  "nombre": "Quinua Real Boliviana",
  "descripcion": "Quinua real del altiplano boliviano, grano grande y de excelente calidad nutricional. Rica en proteínas y minerales. Producto de exportación.",
  "unidad_medida": "quintales",
  "precio_referencial": 850.00,
  "imagen_url": "https://res.cloudinary.com/efresco/image/upload/v123/productos/quinua_real_boliviana.jpg",
  "categorias": [5, 6]
}
```

**Detalles:**
- **Producto:** Quinua real para exportación
- **Precio:** 850.00 Bs por quintal
- **Categorías:** [5] Granos, [6] Productos de Exportación

---

## 🚀 **CÓMO USAR ESTOS EJEMPLOS**

### **1. En Swagger UI:**
1. Ve a `/api-docs`
2. Busca `POST /api/productos`
3. Haz click en "Try it out"
4. Copia y pega cualquiera de los ejemplos JSON arriba
5. Haz click en "Execute"

### **2. Con JavaScript/Fetch:**
```javascript
const crearProducto = async (productoData) => {
  const response = await fetch('/api/productos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tuToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productoData)
  });
  
  const resultado = await response.json();
  console.log(resultado);
};

// Usar con cualquiera de los ejemplos:
crearProducto({
  "nombre": "Papa Blanca Premium",
  "descripcion": "Papa blanca de primera calidad...",
  "unidad_medida": "kg",
  "precio_referencial": 3.50,
  "categorias": [1, 3]
});
```

### **3. Con curl:**
```bash
curl -X POST "http://localhost:3001/api/productos" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Papa Blanca Premium",
    "descripcion": "Papa blanca de primera calidad, cosechada en tierras altas de La Paz",
    "unidad_medida": "kg",
    "precio_referencial": 3.50,
    "categorias": [1, 3]
  }'
```

---

## 📝 **CAMPOS EXPLICADOS**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | ✅ Sí | Nombre del producto |
| `descripcion` | string | ❌ No | Descripción detallada |
| `unidad_medida` | string | ✅ Sí | kg, quintales, toneladas, unidades, etc. |
| `precio_referencial` | number | ❌ No | Precio en Bs (bolivianos) |
| `imagen_url` | string | ❌ No | URL de Cloudinary de la imagen |
| `categorias` | array | ❌ No | Array de IDs de categorías |

---

## 💡 **NOTAS IMPORTANTES**

1. **Solo administradores** pueden crear productos
2. Los **nombres** deben ser únicos
3. **Precio** es referencial (en bolivianos)
4. **Categorías** deben existir en el sistema
5. **Imagen** se puede subir después con endpoint de imagen

---

## 🎯 **PRÓXIMOS PASOS**

Después de crear el producto, puedes:
1. **Subir imagen:** `POST /api/productos/{id}/imagen`
2. **Ver producto:** `GET /api/productos/{id}` 
3. **Actualizar:** `PUT /api/productos/{id}`
4. **Crear anuncio:** `POST /api/anuncios` con este producto