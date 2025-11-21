const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Comentario', {
        id_comentario: {
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
        texto: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'comentario',
        timestamps: false
    });
};