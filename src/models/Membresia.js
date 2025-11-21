const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Membresia', {
        id_membresia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        duracion_dias: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        beneficios: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'membresia',
        timestamps: false
    });
};