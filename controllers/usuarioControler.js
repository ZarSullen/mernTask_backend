// Aquí se agrega la funcionalidad que comunica routes con modelo
// Básicamente definimos las respuestas
import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarID.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailCambiarPassword } from "../helpers/emails.js";


const registrar = async (req, res) => {
    // Evitar registro duplicados
    const {email} = req.body
    // Revisamos si esta ya este Usuario registrado
    const existeUsuario = await Usuario.findOne({email: email})

    // Si ya existe creamos un error para decirle que el Usuario ya esta registrado
    if(existeUsuario) {
        const error = new Error("Usuario ya registrado");
        // Retornamos un estatus 400 y un mensaje json
        return res.status(400).json({msg: error.message});
    } else {
        try {
            // Crea un objeto con la info del modelo y le agregamos la info que viene desde el req.body
            const usuario = new Usuario(req.body) // Crea una instancia el modelo de usuario almacenada en la variable
            
            // usamos la instancia del usuario creada arriba y le generamos el id
            usuario.token = generarId();
            
            await usuario.save() //.save para guardarlo en la base de datos y el guardado se pasa hasta el modelo
            // Se tiene que poner un json para que funcione el POST ya que de otra manera este no se mandara

            // Enviar email de confirmación
            emailRegistro({
                nombre: usuario.nombre,
                email: usuario.email,
                token: usuario.token
            })
            res.json({msg: "Usuario Creado Correctamente Revisa tu Email para confirmar tu cuenta"}) // Retornamos el usuarioAlmacenado
        } catch (error) {
            console.log(error)
        }
    }
}

// Autenticación para hacer el login - Ya debe tener cuenta confirmada
const autenticar = async (req, res) => {
    const {email, password} = req.body;
    // Comprobar el el usuario existe
    const usuario = await Usuario.findOne({email}) // buscamos que lo que se mando en el req sea igual a lo que tengamos la base de datos / si es igual nos retornara el usuario

    if(!usuario) {
        const error = new Error('El Usuario no existe');
        return res.status(404).json({msg: error.message})
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        const error = new Error('Tu Cuenta no ha sido confirmada');
        return res.status(404).json({msg: error.message})
    }


    // Comprobar que el password sea correcto - usamos el method creado desde el modelo 
    if(await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error('El Password es Incorrecto');
        return res.status(404).json({msg: error.message})
    }
};

// Hacemos la confirmación del token
const confirmar = async (req, res) => {
    // Tomamos el token desde la ruta dinámica- El url, entonces se saca desde req.params
    const {token} = req.params

    const usuarioConfirmar = await Usuario.findOne({token}) // buscamos un usuario que el token sea igual el de la url

    // Si no hay un usuario a confirmar le damos un error
    if(!usuarioConfirmar) {
        const error = new Error('Token no Valido');
        return res.status(403).json({msg: error.message})
    }
    // Si si hay un usuario a confirmar cambiamos el estado de confirmar a true
    try {
        usuarioConfirmar.confirmado = true;
        // Restemos el token para seguridad
        usuarioConfirmar.token = "";

        // Para guardar los cambios en la base de datos - siempre se tiene que hacer
        await usuarioConfirmar.save(); // Aquí se ejecutaría otra vez el middleware de 'save' pero como tenemos la comprobación en esa función no sucedería un hashed extra de contraseña
        res.json({msg: "Usuario Confirmado Correctamente"});

    } catch (error) {
        console.log(error)
    }
}

const recuperarPassword = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuario.findOne({email}) // buscamos que lo que se mando en el req sea igual a lo que tengamos la base de datos / si es igual nos retornara el usuario
    if(!usuario) {
        const error = new Error('El Usuario no existe');
        return res.status(404).json({msg: error.message})
    }
    // Si si existe el usuario

    try {
        // Generamos el id para el token
        usuario.token = generarId()
        // Para guardar los cambios en la base de datos - siempre se tiene que hacer
        await usuario.save()

        // Enviar Email
        emailCambiarPassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        res.json({msg: "Hemos enviado un Email con las Instrucciones"})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    // Encontrar un usuario que el tenga el token que esta en los parámetros de la URL
    const tokenValido = await Usuario.findOne({token})

    // Validamos que el token sea vigente
    if(!tokenValido) {
        const error = new Error('El token no es valido');
        return res.status(404).json({msg: error.message})
    } else {
        res.json({msg: "Token valido y el Usuario existe"})
    }
}

const nuevoPassword = async (req , res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token})

    // Validamos que el token sea vigente
    if(!usuario) {
        const error = new Error('El token no es valido');
        return res.status(404).json({msg: error.message})
    } else {
        try {     
            // Cambiamos el password
            usuario.password = password;
            // Removemos el token
            usuario.token = "";
            // Guardamos los cambios
            await usuario.save()
            // Devolvemos como respuesta al llamado un mensaje
            res.json({msg: "Password Modificado Correctamente"})
        } catch (error) {
            console.log(error)
        }
    }
}

const perfil = async (req, res) => {
    // Es lo que creamos en el checkAuth el req.usuario
    const {usuario} = req;

    res.json(usuario)
}

export {
    registrar, 
    autenticar,
    confirmar,
    recuperarPassword,
    comprobarToken,
    nuevoPassword,
    perfil
}