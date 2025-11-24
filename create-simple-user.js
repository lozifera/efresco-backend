// Script simple para crear usuario de prueba
require('dotenv').config();
const { sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

async function crearUsuarioSimple() {
    try {
        console.log('🔄 Creando usuario de prueba directamente...');
        
        // Verificar si existe
        const [results] = await sequelize.query(
            "SELECT email FROM usuario WHERE email = 'test@efresco.com'"
        );
        
        if (results.length > 0) {
            console.log('✅ Usuario de prueba ya existe:');
            console.log('📧 Email: test@efresco.com');
            console.log('🔑 Password: 123456');
            return;
        }
        
        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        await sequelize.query(`
            INSERT INTO usuario (nombre, apellido, email, password_hash, telefono, verificado, fecha_registro)
            VALUES ('Usuario', 'Prueba', 'test@efresco.com', '${hashedPassword}', '70000000', true, NOW())
        `);
        
        console.log('✅ Usuario de prueba creado exitosamente:');
        console.log('📧 Email: test@efresco.com');
        console.log('🔑 Password: 123456');
        
        // Asignar rol de cliente
        const [userResult] = await sequelize.query(
            "SELECT id_usuario FROM usuario WHERE email = 'test@efresco.com'"
        );
        
        const [roleResult] = await sequelize.query(
            "SELECT id_rol FROM rol WHERE nombre = 'cliente'"
        );
        
        if (userResult.length > 0 && roleResult.length > 0) {
            await sequelize.query(`
                INSERT INTO usuario_rol (id_usuario, id_rol)
                VALUES (${userResult[0].id_usuario}, ${roleResult[0].id_rol})
                ON CONFLICT DO NOTHING
            `);
            console.log('✅ Rol cliente asignado');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

crearUsuarioSimple();