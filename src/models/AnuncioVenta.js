const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('AnuncioVenta', {
        id_anuncio: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'producto',
                key: 'id_producto'
            }
        },
        cantidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unidad: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'kg, cajas, quintales'
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ubicacion: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        fecha_publicacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        estado: {
            type: DataTypes.STRING(30),
            defaultValue: 'activo',
            comment: 'activo, vendido, pausado'
        },
        // Campos para moderación y control
        moderado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Anuncio revisado por moderador'
        },
        fecha_moderacion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reportes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Número de reportes por usuarios'
        },
        ubicacion_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            comment: 'Coordenadas GPS para ubicación precisa'
        },
        ubicacion_lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            comment: 'Coordenadas GPS para ubicación precisa'
        }
    }, {
        tableName: 'anuncio_venta',
        timestamps: false
    });
};