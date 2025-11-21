const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ChatbotLog', {
        id_log: {
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
        mensaje_usuario: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        mensaje_bot: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'chatbot_log',
        timestamps: false
    });
};