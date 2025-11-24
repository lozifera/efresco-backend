const fs = require('fs');
const path = require('path');

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../src/public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio uploads creado:', uploadsDir);
} else {
    console.log('✅ Directorio uploads existe:', uploadsDir);
}

// Crear una imagen de prueba simple (SVG)
const testImageSVG = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f8ff"/>
  <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#333">
    EFresco Test Image
  </text>
  <circle cx="200" cy="200" r="50" fill="#4CAF50" opacity="0.7"/>
</svg>
`;

// Guardar imagen de prueba
const testImagePath = path.join(uploadsDir, 'test-image.svg');
fs.writeFileSync(testImagePath, testImageSVG);
console.log('✅ Imagen de prueba creada:', testImagePath);

// Crear un HTML simple de prueba
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test de Imágenes EFresco</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        img { border: 1px solid #ccc; margin: 10px; }
        .test-section { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>🧪 Test de Imágenes EFresco</h1>
    
    <div class="test-section">
        <h2>1. Imagen de Prueba Local</h2>
        <img src="/uploads/test-image.svg" alt="Test Image" width="200">
        <p>URL: <code>/uploads/test-image.svg</code></p>
    </div>
    
    <div class="test-section">
        <h2>2. Test desde Frontend</h2>
        <button onclick="testCORS()">Test CORS</button>
        <div id="result"></div>
    </div>
    
    <script>
        async function testCORS() {
            const result = document.getElementById('result');
            try {
                const response = await fetch('/uploads/test-image.svg');
                if (response.ok) {
                    result.innerHTML = '✅ CORS funcionando correctamente';
                    result.style.color = 'green';
                } else {
                    result.innerHTML = '❌ Error: ' + response.status;
                    result.style.color = 'red';
                }
            } catch (error) {
                result.innerHTML = '❌ Error CORS: ' + error.message;
                result.style.color = 'red';
            }
        }
    </script>
</body>
</html>
`;

// Guardar HTML de prueba
const testHTMLPath = path.join(__dirname, '../test-images.html');
fs.writeFileSync(testHTMLPath, testHTML);
console.log('✅ Página de prueba creada:', testHTMLPath);

console.log('\n🚀 Para probar:');
console.log('1. Inicia el servidor');
console.log('2. Ve a: http://localhost:3001/test-images.html');
console.log('3. O prueba: http://localhost:3001/uploads/test-image.svg');
console.log('4. Debug: http://localhost:3001/debug/uploads');