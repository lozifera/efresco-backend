const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Producción - Render proporciona DATABASE_URL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Desarrollo local o variables separadas
    sequelize = new Sequelize({
        dialect: 'postgres',
        database: process.env.DB_NAME || 'efresco_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'loza',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        logging: console.log
    });
}

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a base de datos establecida correctamente.');
    })
    .catch(err => {
        console.error('❌ Error conectando a base de datos:', err);
    });

module.exports = {
    sequelize, Sequelize
}; 