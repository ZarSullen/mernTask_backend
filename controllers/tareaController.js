import Tarea from "../models/Tarea.js"
import Proyecto from "../models/Proyectos.js"
import Usuario from "../models/Usuario.js";

export const agregarTarea = async (req, res) => {
    const {proyecto} = req.body;

    const proyectoExiste = await Proyecto.findById(proyecto)
    
    // Comprobamos que exista el proyecto 
    if(!proyectoExiste) {
        const error = new Error("El proyecto no existe");
        return res.status(404).json({msg: error.message})
    };

    // Que quien creo la tarea tambien creo el proyecto // // recordar que el usuario lo pasamos al req en el modelo de Usuario
    if(proyectoExiste.creador.toString() !== req.usuario._id.toString()) { 
        const error = new Error("No tienes lo permisos adecuados");
        return res.status(403).json({msg: error.message})
    };

    try {
        const tareaAlmacenada = await Tarea.create(req.body) // podemos poner create para crear en vez de new Tarea si queremos;

        // Almacenar el id en el proyecto existente, tambien podriamos almacenar toda la tarea, mongoo es bueno almacenando grandes cantidades de información sin perder performance
        proyectoExiste.tareas.push(tareaAlmacenada._id)
        // Guardamos los cambios en el proyectoExistente
        await proyectoExiste.save();

        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error)
    }


};
export const obtenerTarea = async (req, res) => {
    const {id} = req.params;
    // Con populate nos traemos toda la informacion de la columna de proyecto definida en el modelo de Tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); // Se especifica la columna que es tarea // Cruza la info

    //Si no existe la tarea
    if(!tarea) {
        const error = new Error("No existe la Tarea");
        return res.status(404).json({msg: error.message})
    }
    // Si el creador de la tarea no es igual al usuario autenticado o el que creo la tarea
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Permitida");
        return res.status(403).json({msg: error.message})
    }
    res.json(tarea)
};
export const actualizarTarea = async (req, res) => {
    const {id} = req.params;
    // Con populate nos traemos toda la informacion de la columna de proyecto definida en el modelo de Tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); // Se especifica la columna que es tarea // Cruza la info

    //Si no existe la tarea
    if(!tarea) {
        const error = new Error("No existe la Tarea");
        return res.status(404).json({msg: error.message})
    };
    // Si el creador de la tarea no es igual al usuario autenticado o el que creo la tarea
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Permitida");
        return res.status(403).json({msg: error.message})
    };

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;


    try {
        const tareaActualizada = await tarea.save();
        res.json(tareaActualizada)
    } catch (error) {
        console.log(error)
    }
};
export const eliminarTarea = async (req, res) => {
    const {id} = req.params;
    // Con populate nos traemos toda la informacion de la columna de proyecto definida en el modelo de Tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); // Se especifica la columna que es tarea // Cruza la info
    console.log(tarea._id)
    //Si no existe la tarea
    if(!tarea) {
        const error = new Error("No existe la Tarea");
        return res.status(404).json({msg: error.message})
    };
    // Si el creador de la tarea no es igual al usuario autenticado o el que creo la tarea
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Permitida");
        return res.status(403).json({msg: error.message})
    };

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto._id)
        proyecto.tareas.pull(tarea._id);
        
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        res.json({msg: "Tarea Eliminada Correctamente"});
    } catch (error) {
        console.log(error)
    }
};
export const cambiarEstado = async (req, res) => {
    const {id} = req.params;
    // Con populate nos traemos toda la informacion de la columna de proyecto definida en el modelo de Tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); // Se especifica la columna que es tarea // Cruza la info
    //Si no existe la tarea
    if(!tarea) {
        const error = new Error("No existe la Tarea");
        return res.status(404).json({msg: error.message})
    };
    
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() !== req.usuario._id.toString())) {
        const error = new Error("Acción no Permitida");
        return res.status(403).json({msg: error.message})
    };
    
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
    // Obtener el nombre del usuario
    const usuario = await Usuario.findById(req.usuario._id);

    // Verificar si se encuentra el usuario
    if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ msg: error.message });
    }

    // Agregar al historial con el nombre del usuario
    if(tarea.estado === true) {
        tarea.historial.push(req.usuario._id);
    }

    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado").populate("historial");
    res.json(tareaAlmacenada)
};

export const obtenerUsuarioHistorial = async (req, res) => {
    const {id} = req.params;
    const usuario = await Usuario.findById(id).select("nombre")
    res.json(usuario)
}
