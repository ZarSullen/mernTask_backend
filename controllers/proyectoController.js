import Proyecto from "../models/Proyectos.js"
import Usuario from "../models/Usuario.js"

// Nos traerá los proyectos del usuario autenticado
const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or': [
            {'colaboradores': { $in: req.usuario}},
            {'creador': { $in: req.usuario}},
        ]
    }).select("-tareas") //Solo servimos la informacion que necesitamos para hacer mas eficaces y rapidas las aplicaciones;
    res.json(proyectos)
}
const nuevoProyecto = async (req, res) => {
    // req.body es lo que le mandamos nosotros, usualmente por medio de un formulario
    const proyecto = new Proyecto(req.body); //Asignamos el nuevo proyecto con los datos dados
    proyecto.creador = req.usuario._id; // y tambien le asignamos el creador del proyecto
    try {
        // Guardamos el proyecto en la base de datos
        const proyectoAlmacenado = await proyecto.save();
        //retornamos el proyecto igual para mostrarlo en el front-end
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}
const obtenerProyecto = async (req, res) => {
    const {id} = req.params;
    // De esta forma solo nos podra traer el proyecto que sea del creador autenticado y solo nos traera ese unico proyecto
                                                                            //populate a colab, //Nos traemos del populate solo estos dos campos
    const proyecto = await Proyecto.findById(id).populate({
        path: "tareas",
        populate: {
            path: "completado",
            select: "nombre"
        }
    })
    .populate({
        path: "tareas",
        populate: {
            path: "historial._id"
        }
    })
    .populate("colaboradores", "email nombre")
    //hacemos el poplulate con la referencia que tenemos en el modelo de proyecto con el nombre de campo tareas

    // Calificamos si existe el proyecto
    if(!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json({msg: error.message})
    }
    // Si la persona que quiere acceder al proyecto no fue quien lo creo // Se pasa a string el valor para que la comparacion sirva // si el id del colaborador no es igual al usuario autenticado entonces no permitimos la acción
    if(req.usuario._id.toString() !== proyecto.creador.toString() && proyecto.colaboradores.some(colaborador => colaborador._id.toString() !== req.usuario._id.toString())) {
        const error = new Error("Acción no Válida");
        return res.status(401).json({msg: error.message})
    };

    // Se muestra el proyecto
    res.json(proyecto)
}
const editarProyecto = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id)

    // Calificamos si existe el proyecto
    if(!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json({msg: error.message})
    }
    // Si la persona que quiere acceder al proyecto no fue quien lo creo // Se pasa a string el valor para que la comparacion sirva
    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("Acción no Válida");
        return res.status(401).json({msg: error.message})
    };
    // Siempre que se quiera actualizar hay que poner primero el valor actualizado y luego el otro en caso de que no se actualice
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;

    try {
        const proyectoActualizado = await proyecto.save();
        res.json(proyectoActualizado)
    } catch (error) {
        console.log(error)
    }
}
const eliminarProyecto = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id)

    // Calificamos si existe el proyecto
    if(!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json({msg: error.message})
    }
    // Si la persona que quiere acceder al proyecto no fue quien lo creo // Se pasa a string el valor para que la comparacion sirva
    if(req.usuario._id.toString() !== proyecto.creador.toString()) {
        const error = new Error("Acción no Válida");
        return res.status(401).json({msg: error.message})
    };

    try {
        await proyecto.deleteOne()
        res.json({msg: "Proyecto Eliminado Correctamente"});
    } catch (error) {
        console.log(error)
    }

}
const buscarColaborador = async (req, res) => {
    const {email} = req.body;
    
    const usuario = await Usuario.findOne({email}).select("-password -confirmado -__v -updatedAt -token -createdAt")

    if(!usuario) {
        const error = new Error("Usuario no Encontrado")
        return res.status(404).json({msg: error.message})
    }

    try {
        res.json(usuario)
    } catch (error) {
        console.log(error)
    }
}
const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto) {
        const error = new Error("Proyecto no Encontrado")
        return res.status(404).json({msg: error.message})
    };

    // La persona quien quiere agregar a un colaborador no es quien creo el proyecto
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})
    };

    const {email} = req.body;
    
    const usuario = await Usuario.findOne({email}).select("-password -confirmado -__v -updatedAt -token -createdAt")
    console.log(usuario)
    if(!usuario) {
        const error = new Error("Usuario no Encontrado")
        return res.status(404).json({msg: error.message})
    };

    // El colaborador no es el admin del proyecto // Se quiere agregar el mismo creador del proyecto como colaborador
    if(proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("No puedes agregarte como colaborador")
        return res.status(404).json({msg: error.message})
    };

    // Revisar que no este agregado ya al proyecto el colaborador
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El usuario ya pertenece a este Proyecto")
        return res.status(404).json({msg: error.message})
    };

    // Agregar el usuario

    proyecto.colaboradores.push(usuario._id);

    await proyecto.save();

    res.json({msg: "Colaborador Agregado Correctamente"})
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto) {
        const error = new Error("Proyecto no Encontrado")
        return res.status(404).json({msg: error.message})
    };

    // La persona quien quiere agregar a un colaborador no es quien creo el proyecto
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})
    };
    // Se puede eliminar
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({msg: "Colaborador Eliminado Correctamente"})
}
export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarColaborador,
    eliminarProyecto,
    agregarColaborador,
    buscarColaborador
}