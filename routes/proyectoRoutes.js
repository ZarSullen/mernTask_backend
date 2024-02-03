import express from "express"
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarColaborador,
    eliminarProyecto,
    agregarColaborador,
    buscarColaborador
} from "../controllers/proyectoController.js"

// CheckAuth es el middleware que checka la autorizacion del usuario para poder hacer acciones con sus proyectos solamente, para protegerlo de que otra gente desconozida no intente hacer cosas con sus proyectos
import checkAuth from "../middleware/checkAuth.js"

const router = express.Router()

router.route("/").get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto);
router.route("/:id").get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;