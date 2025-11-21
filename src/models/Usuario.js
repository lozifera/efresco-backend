const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Usuario', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        direccion: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        ubicacion_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true
        },
        ubicacion_lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        // Campos adicionales para mejorar seguridad
        documento_identidad: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'CI o documento de identidad para verificación'
        },
        foto_perfil_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL de foto para verificación de identidad'
        },
        verificado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Usuario verificado con CI + foto'
        },
        limite_anuncios_diarios: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Límite de anuncios por día para evitar spam'
        },
        anuncios_publicados_hoy: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Contador de anuncios publicados hoy'
        },
        ultima_publicacion: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Última fecha de publicación para resetear contador'
        },
        reset_password_token: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Token para recuperación de contraseña'
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha de expiración del token de reset'
        }
    }, {
        tableName: 'usuario',
        timestamps: false
    });
};