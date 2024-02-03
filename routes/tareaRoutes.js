import express from "express"
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea, 
    eliminarTarea,
    cambiarEstado,
    obtenerUsuarioHistorial
} from "../controllers/tareaController.js";

// CheckAuth es el middleware que checka la autorizacion del usuario para poder hacer acciones con sus proyectos solamente, para protegerlo de que otra gente desconozida no intente hacer cosas con sus proyectos
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.post("/", checkAuth, agregarTarea);
router.route('/:id').get(checkAuth, obtenerTarea).put(checkAuth, actualizarTarea).delete(checkAuth, eliminarTarea);
router.post("/estado/:id", checkAuth, cambiarEstado)
router.get("/obtenerUsuario/:id", checkAuth, obtenerUsuarioHistorial)

export default router;