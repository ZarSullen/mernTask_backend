// Este custom middleware es para proteger las rutas que tenemos
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
// MIDDLEWARE PARA verificar el JWT que sea valido que exista que se envie media headers y si esta bien que pase al siguiente middleware que es mostrar el perfil

// Recuerda que next nos permite pasarnos al siguiente middleware, y como tenemos dos en el endpoint es necesario
const checkAuth = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; //split con 1 espacio en blanco parte el arreglo en 2 o si hubiera más palabras lo parte en las disponibles, si se deja sin espacio, parte las letras de todooo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v") //De esta forma quitamos lo que no requerimos del objeto

            return next()
        } catch (error) {
            return res.status(404).json({msg: "Hubo un error"}) //Si ya expiro el token 
        }
    }

    // Si el usuario no manda un token
    if(!token) {
        const error = new Error("Token no valido")
        return res.status(401).json({msg: error.message})
    }

    next()
};

export default checkAuth