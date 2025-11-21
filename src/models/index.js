// Usar la misma configuración de db.config.js
const { sequelize } = require('../config/db.config');

// Importar todos los modelos
const Usuario = require('./Usuario')(sequelize);
const Rol = require('./Rol')(sequelize);
const UsuarioRol = require('./UsuarioRol')(sequelize);
const Producto = require('./Producto')(sequelize);
const Categoria = require('./Categoria')(sequelize);
const ProductoCategoria = require('./ProductoCategoria')(sequelize);
const AnuncioVenta = require('./AnuncioVenta')(sequelize);
const AnuncioCompra = require('./AnuncioCompra')(sequelize);
const Pedido = require('./Pedido')(sequelize);
const PagoQr = require('./PagoQr')(sequelize);
const Comentario = require('./Comentario')(sequelize);
const Reputacion = require('./Reputacion')(sequelize);
const Favoritos = require('./Favoritos')(sequelize);
const Membresia = require('./Membresia')(sequelize);
const UsuarioMembresia = require('./UsuarioMembresia')(sequelize);
const Chat = require('./Chat')(sequelize);
const Mensaje = require('./Mensaje')(sequelize);
const ChatbotLog = require('./ChatbotLog')(sequelize);

// Definir asociaciones/relaciones

// Usuario - Rol (muchos a muchos)
Usuario.belongsToMany(Rol, { 
    through: UsuarioRol, 
    foreignKey: 'id_usuario',
    otherKey: 'id_rol' 
});
Rol.belongsToMany(Usuario, { 
    through: UsuarioRol, 
    foreignKey: 'id_rol',
    otherKey: 'id_usuario' 
});

// Producto - Categoria (muchos a muchos)
Producto.belongsToMany(Categoria, { 
    through: ProductoCategoria, 
    foreignKey: 'id_producto',
    otherKey: 'id_categoria' 
});
Categoria.belongsToMany(Producto, { 
    through: ProductoCategoria, 
    foreignKey: 'id_categoria',
    otherKey: 'id_producto' 
});

// Usuario - AnuncioVenta (uno a muchos)
Usuario.hasMany(AnuncioVenta, { foreignKey: 'id_usuario' });
AnuncioVenta.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Producto - AnuncioVenta (uno a muchos)
Producto.hasMany(AnuncioVenta, { foreignKey: 'id_producto' });
AnuncioVenta.belongsTo(Producto, { foreignKey: 'id_producto' });

// Usuario - AnuncioCompra (uno a muchos)
Usuario.hasMany(AnuncioCompra, { foreignKey: 'id_usuario' });
AnuncioCompra.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Producto - AnuncioCompra (uno a muchos)
Producto.hasMany(AnuncioCompra, { foreignKey: 'id_producto' });
AnuncioCompra.belongsTo(Producto, { foreignKey: 'id_producto' });

// Usuario - Pedido (comprador y vendedor)
Usuario.hasMany(Pedido, { as: 'PedidosComoComprador', foreignKey: 'id_comprador' });
Usuario.hasMany(Pedido, { as: 'PedidosComoVendedor', foreignKey: 'id_vendedor' });
Pedido.belongsTo(Usuario, { as: 'Comprador', foreignKey: 'id_comprador' });
Pedido.belongsTo(Usuario, { as: 'Vendedor', foreignKey: 'id_vendedor' });

// Pedido - PagoQr (uno a muchos)
Pedido.hasMany(PagoQr, { foreignKey: 'id_pedido' });
PagoQr.belongsTo(Pedido, { foreignKey: 'id_pedido' });

// Usuario - Comentario (uno a muchos)
Usuario.hasMany(Comentario, { foreignKey: 'id_usuario' });
Comentario.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Producto - Comentario (uno a muchos)
Producto.hasMany(Comentario, { foreignKey: 'id_producto' });
Comentario.belongsTo(Producto, { foreignKey: 'id_producto' });

// Usuario - Reputacion (valorado y quien califica)
Usuario.hasMany(Reputacion, { as: 'ReputacionRecibida', foreignKey: 'id_usuario_valorado' });
Usuario.hasMany(Reputacion, { as: 'ReputacionOtorgada', foreignKey: 'id_usuario_que_califica' });
Reputacion.belongsTo(Usuario, { as: 'UsuarioValorado', foreignKey: 'id_usuario_valorado' });
Reputacion.belongsTo(Usuario, { as: 'UsuarioQueCalifica', foreignKey: 'id_usuario_que_califica' });

// Pedido - Reputacion (uno a uno)
Pedido.hasOne(Reputacion, { foreignKey: 'id_pedido' });
Reputacion.belongsTo(Pedido, { foreignKey: 'id_pedido' });

// Usuario - Favoritos (uno a muchos)
Usuario.hasMany(Favoritos, { foreignKey: 'id_usuario' });
Favoritos.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Producto - Favoritos (uno a muchos)
Producto.hasMany(Favoritos, { foreignKey: 'id_producto' });
Favoritos.belongsTo(Producto, { foreignKey: 'id_producto' });

// Usuario - Membresia (muchos a muchos)
Usuario.belongsToMany(Membresia, { 
    through: UsuarioMembresia, 
    foreignKey: 'id_usuario',
    otherKey: 'id_membresia' 
});
Membresia.belongsToMany(Usuario, { 
    through: UsuarioMembresia, 
    foreignKey: 'id_membresia',
    otherKey: 'id_usuario' 
});

// Usuario - Chat (dos usuarios por chat)
Usuario.hasMany(Chat, { as: 'ChatsComoUsuario1', foreignKey: 'id_usuario_1' });
Usuario.hasMany(Chat, { as: 'ChatsComoUsuario2', foreignKey: 'id_usuario_2' });
Chat.belongsTo(Usuario, { as: 'Usuario1', foreignKey: 'id_usuario_1' });
Chat.belongsTo(Usuario, { as: 'Usuario2', foreignKey: 'id_usuario_2' });

// Chat - Mensaje (uno a muchos)
Chat.hasMany(Mensaje, { foreignKey: 'id_chat' });
Mensaje.belongsTo(Chat, { foreignKey: 'id_chat' });

// Usuario - Mensaje (uno a muchos)
Usuario.hasMany(Mensaje, { foreignKey: 'id_usuario' });
Mensaje.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Usuario - ChatbotLog (uno a muchos)
Usuario.hasMany(ChatbotLog, { foreignKey: 'id_usuario' });
ChatbotLog.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Exportar modelos y sequelize
module.exports = {
    sequelize,
    Usuario,
    Rol,
    UsuarioRol,
    Producto,
    Categoria,
    ProductoCategoria,
    AnuncioVenta,
    AnuncioCompra,
    Pedido,
    PagoQr,
    Comentario,
    Reputacion,
    Favoritos,
    Membresia,
    UsuarioMembresia,
    Chat,
    Mensaje,
    ChatbotLog
};