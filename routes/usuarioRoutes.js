// Forma de crear el routing
import express from "express";
const router = express.Router();

import {
    registrar, 
    autenticar, 
    confirmar, 
    recuperarPassword, 
    comprobarToken, 
    nuevoPassword, 
    perfil 
} from "../controllers/usuarioControler.js" 

import checkAuth from "../middleware/checkAuth.js";

// Cuando hay un get hacia la url "/" entonces se ejecutara este código
// diagonal significa la misma url definida en el index ("api/usuarios")

// Area publica

// Autenticación, Registro y Confirmación de Usuarios
router.post('/', registrar); //Crea un nuevo usuario
router.post('/login', autenticar);
// Routing dinámico
router.get('/confirmar/:token', confirmar);
router.post('/recuperar-password', recuperarPassword);
// Cuando se tiene una misma ruta se puede usar .route y cuando sea .get se usara la función puesta, igual con .post
router.route('/recuperar-password/:token').get(comprobarToken).post(nuevoPassword)

// Le pasaremos el JSONWT y nos pasara el perfil del usuario
router.get('/perfil', checkAuth, perfil) // primero entramos al endpoint, segundo ejecuta el middleware y tercero perfil 



export default router