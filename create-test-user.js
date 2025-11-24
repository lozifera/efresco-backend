// Script para crear un usuario de prueba para Cloudinary
require('dotenv').config();
const { Usuario, Rol, UsuarioRol } = require('./src/models');
const bcrypt = require('bcryptjs');

async function crearUsuarioPrueba() {
    try {
        console.log('🔄 Creando usuario de prueba...');
        
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: { email: 'test@efresco.com' }
        });
        
        if (usuarioExistente) {
            console.log('✅ Usuario de prueba ya existe:');
            console.log('📧 Email: test@efresco.com');
            console.log('🔑 Password: 123456');
            return usuarioExistente;
        }
        
        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const nuevoUsuario = await Usuario.create({
            nombre: 'Usuario',
            apellido: 'Prueba',
            email: 'test@efresco.com',
            password: hashedPassword,
            telefono: '70000000',
            verificado: true,
            fecha_registro: new Date()
        });
        
        // Asignar rol de cliente
        const rolCliente = await Rol.findOne({ where: { nombre: 'cliente' } });
        
        if (rolCliente) {
            await UsuarioRol.create({
                id_usuario: nuevoUsuario.id_usuario,
                id_rol: rolCliente.id_rol
            });
        }
        
        console.log('✅ Usuario de prueba creado exitosamente:');
        console.log('📧 Email: test@efresco.com');
        console.log('🔑 Password: 123456');
        console.log('🆔 ID Usuario:', nuevoUsuario.id_usuario);
        
        return nuevoUsuario;
        
    } catch (error) {
        console.error('❌ Error creando usuario de prueba:', error);
        throw error;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    crearUsuarioPrueba()
        .then(() => {
            console.log('🎉 ¡Usuario de prueba listo para usar!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error:', error.message);
            process.exit(1);
        });
}

module.exports = { crearUsuarioPrueba };