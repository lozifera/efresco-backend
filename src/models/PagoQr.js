const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('PagoQr', {
        id_pago: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_pedido: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pedido',
                key: 'id_pedido'
            }
        },
        qr_data: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'código QR generado'
        },
        comprobante_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'imagen subida por el usuario'
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // Campos para prevenir estafas
        comprobante_verificado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Comprobante verificado manualmente'
        },
        hash_comprobante: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Hash del archivo para detectar duplicados'
        },
        tamaño_archivo_mb: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Tamaño del comprobante para control'
        }
    }, {
        tableName: 'pago_qr',
        timestamps: false
    });
};