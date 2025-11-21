const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Utilidades para tokens de seguridad
 */
class TokenUtils {
    /**
     * Genera un token seguro para recuperación de contraseñas
     * Combina UUID + timestamp + random bytes para máxima seguridad
     * @returns {string} Token seguro único
     */
    static generarTokenRecuperacion() {
        const uuid = uuidv4();
        const timestamp = Date.now().toString(36);
        const randomBytes = crypto.randomBytes(32).toString('hex');
        
        // Combinamos y hasheamos para token final
        const tokenData = `${uuid}-${timestamp}-${randomBytes}`;
        return crypto.createHash('sha256').update(tokenData).digest('hex');
    }

    /**
     * Genera un hash del token para almacenar en BD
     * @param {string} token - Token original
     * @returns {string} Hash del token para almacenar en BD
     */
    static hashearToken(token) {
        return crypto.createHash('sha512').update(token).digest('hex');
    }

    /**
     * Verifica si un token coincide con su hash almacenado
     * @param {string} token - Token a verificar
     * @param {string} hashedToken - Hash almacenado en BD
     * @returns {boolean} True si coinciden
     */
    static verificarToken(token, hashedToken) {
        const tokenHash = this.hashearToken(token);
        return crypto.timingSafeEqual(
            Buffer.from(tokenHash, 'hex'),
            Buffer.from(hashedToken, 'hex')
        );
    }

    /**
     * Calcula fecha de expiración del token (15 minutos por defecto)
     * @param {number} minutosExpiracion - Minutos hasta expiración
     * @returns {Date} Fecha de expiración
     */
    static calcularFechaExpiracion(minutosExpiracion = 15) {
        const ahora = new Date();
        return new Date(ahora.getTime() + (minutosExpiracion * 60 * 1000));
    }

    /**
     * Verifica si un token ha expirado
     * @param {Date} fechaExpiracion - Fecha de expiración del token
     * @returns {boolean} True si ha expirado
     */
    static tokenExpirado(fechaExpiracion) {
        return new Date() > new Date(fechaExpiracion);
    }

    /**
     * Limpia tokens expirados (para usar en cron jobs)
     * @param {Object} Usuario - Modelo de Usuario de Sequelize
     * @returns {Promise<number>} Número de tokens eliminados
     */
    static async limpiarTokensExpirados(Usuario) {
        try {
            const resultado = await Usuario.update(
                {
                    reset_password_token: null,
                    reset_password_expires: null
                },
                {
                    where: {
                        reset_password_expires: {
                            [require('sequelize').Op.lt]: new Date()
                        }
                    }
                }
            );

            console.log(`🧹 Limpiados ${resultado[0]} tokens expirados`);
            return resultado[0];
        } catch (error) {
            console.error('❌ Error limpiando tokens expirados:', error);
            return 0;
        }
    }
}

module.exports = TokenUtils;