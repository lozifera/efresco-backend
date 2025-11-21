const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ProductoCategoria', {
        id_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'producto',
                key: 'id_producto'
            }
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'categoria',
                key: 'id_categoria'
            }
        }
    }, {
        tableName: 'producto_categoria',
        timestamps: false
    });
};