const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Reputacion', {
        id_reputacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario_valorado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_usuario_que_califica: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_pedido: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pedido',
                key: 'id_pedido'
            }
        },
        calificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'Calificación entre 1 y 5'
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'reputacion',
        timestamps: false
    });
};