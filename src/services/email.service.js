const nodemailer = require('nodemailer');

/**
 * Configuración del servicio de email
 * Configurar con Gmail, Outlook, o cualquier proveedor SMTP
 */
class EmailService {
    constructor() {
        // Configuración para Gmail (más común y gratuito)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu email de Gmail
                pass: process.env.EMAIL_PASS  // App Password de Gmail
            }
        });

        // Configuración alternativa para otros proveedores
        // this.transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST,
        //     port: process.env.SMTP_PORT,
        //     secure: true, // true para port 465, false para otros
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS
        //     }
        // });
    }

    /**
     * Envía email de recuperación de contraseña
     * @param {string} email - Email del destinatario
     * @param {string} resetToken - Token de recuperación
     * @param {string} userName - Nombre del usuario
     * @returns {Promise} Resultado del envío
     */
    async enviarEmailRecuperacion(email, resetToken, userName = '') {
        try {
            // URL de tu aplicación frontend para resetear contraseña
            const resetURL = process.env.FRONTEND_URL 
                ? `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
                : `http://localhost:3000/reset-password?token=${resetToken}`;

            const mailOptions = {
                from: `"EFresco - Recuperación" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Recuperación de Contraseña - EFresco',
                html: this.generarHTMLRecuperacion(userName, resetURL, resetToken)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado a ${email}: ${result.messageId}`);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw new Error('Error al enviar email de recuperación');
        }
    }

    /**
     * Genera HTML para el email de recuperación
     * @param {string} userName - Nombre del usuario
     * @param {string} resetURL - URL de reset
     * @param {string} resetToken - Token de recuperación
     * @returns {string} HTML del email
     */
    generarHTMLRecuperacion(userName, resetURL, resetToken) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                        🌱 EFresco
                                    </h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                                        Marketplace Agrícola
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                                        🔐 Recuperación de Contraseña
                                    </h2>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hola <strong>${userName}</strong>,
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en EFresco. 
                                        Si no fuiste tú, puedes ignorar este correo de forma segura.
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Para crear una nueva contraseña, haz clic en el siguiente botón:
                                    </p>
                                    
                                    <!-- Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetURL}" 
                                                   style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #28a745, #20c997); 
                                                          color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; 
                                                          font-size: 16px; box-shadow: 0 3px 8px rgba(40, 167, 69, 0.3);">
                                                    🔄 Restablecer Contraseña
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 4px;">
                                        <p style="color: #856404; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                                            ⚠️ Información importante:
                                        </p>
                                        <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
                                            <li>Este enlace expira en <strong>15 minutos</strong> por seguridad</li>
                                            <li>Solo puedes usar este enlace una vez</li>
                                            <li>Si no solicitaste esto, ignora este correo</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0;">
                                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                                    </p>
                                    <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 10px 0;">
                                        ${resetURL}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; font-size: 14px; margin: 0 0 10px 0;">
                                        Este es un correo automático, no respondas a este mensaje.
                                    </p>
                                    <p style="color: #999999; font-size: 14px; margin: 0;">
                                        © ${new Date().getFullYear()} EFresco - Conectando el campo con tu mesa 🚀
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    }

    /**
     * Verifica la configuración del servicio de email
     * @returns {Promise<boolean>} True si la configuración es válida
     */
    async verificarConfiguracion() {
        try {
            await this.transporter.verify();
            console.log('✅ Servicio de email configurado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error en configuración de email:', error);
            return false;
        }
    }
}

module.exports = new EmailService();