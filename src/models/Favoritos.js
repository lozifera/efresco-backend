const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Favoritos', {
        id_favorito: {
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
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'favoritos',
        timestamps: false
    });
};