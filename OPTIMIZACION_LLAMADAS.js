// ESTRATEGIAS PARA OPTIMIZAR LLAMADAS API

// ❌ MALO: Muchas llamadas separadas
const cargarDatos = async () => {
    const productos = await fetch('/api/productos');
    const categorias = await fetch('/api/categorias'); 
    const usuario = await fetch('/api/usuarios/perfil');
    const favoritos = await fetch('/api/favoritos');
    // 4 llamadas = menos eficiente
};

// ✅ BUENO: Una sola llamada que trae todo
const cargarDashboard = async () => {
    const data = await fetch('/api/dashboard'); // 1 sola llamada
    // Backend retorna: { productos, categorias, usuario, favoritos }
};

// ✅ BUENO: Batch operations
const crearMultiplesProductos = async (productos) => {
    const response = await fetch('/api/productos/batch', {
        method: 'POST',
        body: JSON.stringify({ productos: productos }) // Múltiples en 1 llamada
    });
};

// ✅ BUENO: Cache en frontend
let productosCache = null;
const getProductos = async () => {
    if (productosCache && Date.now() - productosCache.timestamp < 60000) {
        return productosCache.data; // No hace llamada
    }
    
    const productos = await fetch('/api/productos');
    productosCache = { 
        data: productos, 
        timestamp: Date.now() 
    };
    return productos;
};

// ✅ BUENO: Paginación inteligente
const cargarProductos = async (page = 1, limit = 20) => {
    const productos = await fetch(`/api/productos?page=${page}&limit=${limit}`);
    // Solo carga lo necesario
};

// ✅ BUENO: WebSockets para tiempo real (no cuenta en rate limit)
const socket = io('https://tu-app.onrender.com');
socket.on('nuevoProducto', (producto) => {
    // Actualización en tiempo real sin llamadas API
});

// ✅ BUENO: Debounce para búsquedas
const buscarProductos = debounce(async (query) => {
    const resultados = await fetch(`/api/productos/buscar?q=${query}`);
}, 500); // Espera 500ms antes de hacer la llamada