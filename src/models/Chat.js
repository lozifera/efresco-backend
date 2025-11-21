const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Chat', {
        id_chat: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_usuario_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'chat',
        timestamps: false
    });
};