const { sequelize } = require('../src/config/db.config');
const models = require('../src/models');
const bcrypt = require('bcryptjs');

/**
 * Script para inicializar base de datos en producción
 * Crea tablas, roles básicos y usuario administrador
 */
async function initProduction() {
    try {
        console.log('🚀 Iniciando configuración de base de datos...');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');

        // Sincronizar modelos (crear tablas)
        await sequelize.sync({ force: false });
        console.log('✅ Tablas sincronizadas correctamente');

        // Obtener modelos
        const { Usuario, Rol, UsuarioRol, Categoria, Producto } = models;

        // Crear roles básicos
        console.log('📋 Creando roles básicos...');
        const [rolAdmin] = await Rol.findOrCreate({
            where: { nombre: 'administrador' },
            defaults: { 
                nombre: 'administrador',
                descripcion: 'Administrador del sistema con acceso completo' 
            }
        });

        const [rolCliente] = await Rol.findOrCreate({
            where: { nombre: 'cliente' },
            defaults: { 
                nombre: 'cliente',
                descripcion: 'Cliente que puede comprar productos' 
            }
        });

        const [rolProductor] = await Rol.findOrCreate({
            where: { nombre: 'productor' },
            defaults: { 
                nombre: 'productor',
                descripcion: 'Productor que puede vender productos agrícolas' 
            }
        });

        console.log('✅ Roles creados: administrador, cliente, productor');

        // Crear categorías básicas
        console.log('🏷️ Creando categorías básicas...');
        const categorias = [
            { nombre: 'Frutas', descripcion: 'Frutas frescas y de temporada' },
            { nombre: 'Verduras', descripcion: 'Verduras y hortalizas' },
            { nombre: 'Cereales', descripcion: 'Cereales y granos' },
            { nombre: 'Legumbres', descripcion: 'Legumbres y frutos secos' },
            { nombre: 'Hierbas', descripcion: 'Hierbas aromáticas y medicinales' },
            { nombre: 'Lácteos', descripcion: 'Productos lácteos artesanales' }
        ];

        for (const categoria of categorias) {
            await Categoria.findOrCreate({
                where: { nombre: categoria.nombre },
                defaults: categoria
            });
        }
        console.log('✅ Categorías creadas correctamente');

        // Crear usuario administrador
        console.log('👤 Creando usuario administrador...');
        const adminEmail = 'admin@efresco.com';
        const adminPassword = 'efresco2024';

        const adminExiste = await Usuario.findOne({ 
            where: { email: adminEmail } 
        });

        if (!adminExiste) {
            const passwordHash = await bcrypt.hash(adminPassword, 12);
            
            const admin = await Usuario.create({
                nombre: 'Administrador',
                apellido: 'EFresco',
                email: adminEmail,
                password_hash: passwordHash,
                telefono: '+1234567890',
                direccion: 'Oficina Central EFresco',
                ciudad: 'La Paz',
                pais: 'Bolivia',
                esta_activo: true,
                email_verificado: true,
                verificado: true
            });

            // Asignar rol de administrador
            await UsuarioRol.create({
                id_usuario: admin.id_usuario,
                id_rol: rolAdmin.id_rol
            });

            console.log('✅ Usuario administrador creado:');
            console.log(`   📧 Email: ${adminEmail}`);
            console.log(`   🔒 Password: ${adminPassword}`);
        } else {
            console.log('ℹ️ Usuario administrador ya existe');
        }

        // Crear usuario de prueba (productor)
        console.log('👨‍🌾 Creando usuario productor de prueba...');
        const productorEmail = 'productor@efresco.com';
        const productorPassword = 'productor123';

        const productorExiste = await Usuario.findOne({ 
            where: { email: productorEmail } 
        });

        if (!productorExiste) {
            const passwordHash = await bcrypt.hash(productorPassword, 12);
            
            const productor = await Usuario.create({
                nombre: 'Juan',
                apellido: 'Agricultor',
                email: productorEmail,
                password_hash: passwordHash,
                telefono: '+59123456789',
                direccion: 'Zona Rural, Cochabamba',
                ciudad: 'Cochabamba',
                pais: 'Bolivia',
                esta_activo: true,
                ubicacion_lat: -17.3935,
                ubicacion_lng: -66.1570
            });

            // Asignar rol de productor
            await UsuarioRol.create({
                id_usuario: productor.id_usuario,
                id_rol: rolProductor.id_rol
            });

            console.log('✅ Usuario productor creado:');
            console.log(`   📧 Email: ${productorEmail}`);
            console.log(`   🔒 Password: ${productorPassword}`);
        } else {
            console.log('ℹ️ Usuario productor ya existe');
        }

        console.log('\n🎉 ¡Base de datos inicializada correctamente!');
        console.log('\n📋 CREDENCIALES DE ACCESO:');
        console.log('👨‍💼 Administrador:');
        console.log(`   📧 ${adminEmail}`);
        console.log(`   🔒 ${adminPassword}`);
        console.log('\n👨‍🌾 Productor:');
        console.log(`   📧 ${productorEmail}`);
        console.log(`   🔒 ${productorPassword}`);
        console.log('\n🌐 Swagger Docs: https://tu-app.onrender.com/api/docs');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initProduction();
}

module.exports = initProduction;