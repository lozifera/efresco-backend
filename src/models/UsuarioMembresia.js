const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UsuarioMembresia', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_membresia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'membresia',
                key: 'id_membresia'
            }
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            primaryKey: true,
            defaultValue: DataTypes.NOW
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'usuario_membresia',
        timestamps: false
    });
};