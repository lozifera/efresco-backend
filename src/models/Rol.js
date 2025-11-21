const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Rol', {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'administrador / cliente / productor'
        }
    }, {
        tableName: 'rol',
        timestamps: false
    });
};