import jwt from "jsonwebtoken";


// Generamos un JWT que es información encriptada para los token y genera un objeto con ese id
const generarJWT = (id) => {
    return jwt.sign( {id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export default generarJWT