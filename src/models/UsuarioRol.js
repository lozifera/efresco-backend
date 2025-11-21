const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UsuarioRol', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'rol',
                key: 'id_rol'
            }
        }
    }, {
        tableName: 'usuario_rol',
        timestamps: false
    });
};