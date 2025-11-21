const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Producto', {
        id_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        unidad_medida: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'kg, arrobas, cajas, quintales'
        },
        precio_referencial: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        imagen_url: {
            type: DataTypes.TEXT,
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
        // Campos para mejorar gestión de imágenes
        imagen_comprimida_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL de imagen comprimida automáticamente'
        },
        tamaño_imagen_mb: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Tamaño de imagen para control de peso'
        }
    }, {
        tableName: 'producto',
        timestamps: false
    });
};