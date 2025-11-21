const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Categoria', {
        id_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'categoria',
        timestamps: false
    });
};