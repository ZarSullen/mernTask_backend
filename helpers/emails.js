import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
    const {email, token, nombre} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
    });


    // información del email;
    const info = await transport.sendMail({
        from: '"UpTask - Administración de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask Confirma tu Cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre}, Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya esta casi lista, haz click en el siguiente enlace para confirmar tu cuenta y comenzar a usarla</p>

        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta </a>
            
        <p>¿Tu no creaste esta cuenta? Ignora este mensaje!</p>
        `
    })
}

export const emailCambiarPassword = async (datos) => {
    const {email, token, nombre} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
    });


    // información del email;
    const info = await transport.sendMail({
        from: '"UpTask - Administración de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask Cambia tu Contraseña",
        text: "Cambia tu Contraseña en UpTask",
        html: `<p>Hola: ${nombre}, Cambia tu Contraseña</p>
        <p>Para cambiar tu contraseña has click en el siguiente enlace</p>

        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Contraseña </a>
            
        <p>¿No mandaste el correo para cambiar tu contraseña? ¡Ignora este mensaje!</p>
        `
    })
}