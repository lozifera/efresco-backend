const { Rol, Categoria } = require('../models');

const poblarDatosIniciales = async () => {
    try {
        console.log('🌱 Poblando datos iniciales...');

        // Crear roles básicos
        const rolesIniciales = [
            { nombre: 'administrador' },
            { nombre: 'cliente' },
            { nombre: 'productor' }
        ];

        for (const rol of rolesIniciales) {
            const [, created] = await Rol.findOrCreate({
                where: { nombre: rol.nombre },
                defaults: rol
            });
            
            if (created) {
                console.log(`✅ Rol creado: ${rol.nombre}`);
            } else {
                console.log(`ℹ️  Rol ya existe: ${rol.nombre}`);
            }
        }

        // Crear categorías básicas
        const categoriasIniciales = [
            { nombre: 'Cereales' },
            { nombre: 'Legumbres' },
            { nombre: 'Tubérculos' },
            { nombre: 'Frutas' },
            { nombre: 'Verduras' },
            { nombre: 'Hortalizas' },
            { nombre: 'Granos' },
            { nombre: 'Productos Lácteos' },
            { nombre: 'Carnes' },
            { nombre: 'Otros' }
        ];

        for (const categoria of categoriasIniciales) {
            const [, created] = await Categoria.findOrCreate({
                where: { nombre: categoria.nombre },
                defaults: categoria
            });
            
            if (created) {
                console.log(`✅ Categoría creada: ${categoria.nombre}`);
            } else {
                console.log(`ℹ️  Categoría ya existe: ${categoria.nombre}`);
            }
        }

        console.log('🎉 Datos iniciales poblados exitosamente');
        
    } catch (error) {
        console.error('❌ Error al poblar datos iniciales:', error);
        throw error;
    }
};

module.exports = poblarDatosIniciales;