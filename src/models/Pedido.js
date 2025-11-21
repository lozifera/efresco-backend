const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Pedido', {
        id_pedido: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_comprador: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_vendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_anuncio: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tipo_anuncio: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'compra / venta'
        },
        monto_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estado: {
            type: DataTypes.STRING(20),
            defaultValue: 'pendiente',
            comment: 'pendiente, pagado, enviado, completado, cancelado'
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // Campos adicionales para mejorar seguridad
        verificado_manualmente: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Pago verificado manualmente por administrador'
        },
        notas_verificacion: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas del proceso de verificación manual'
        }
    }, {
        tableName: 'pedido',
        timestamps: false
    });
};