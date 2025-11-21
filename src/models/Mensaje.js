const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Mensaje', {
        id_mensaje: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_chat: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chat',
                key: 'id_chat'
            }
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        archivo_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'fotos, qr, comprobantes'
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // Campos para controlar archivos en chat
        tamaño_archivo_mb: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Tamaño del archivo para límite 5-10 MB'
        },
        tipo_archivo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'imagen, pdf, documento'
        },
        archivo_comprimido_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL del archivo comprimido automáticamente'
        }
    }, {
        tableName: 'mensaje',
        timestamps: false
    });
};