import mongoose from "mongoose";

const proyectoSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true
    }, 
    creador: {
        type: mongoose.Schema.Types.ObjectId, //Para relacionar el usuario que este autenticado y confirmado
        ref: 'Usuario'
    },
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea"
        }
    ],
    colaboradores: [ // Puede haber mas de un colaborador por eso es un objeto
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'  
    }
]
}, {
    timestamps: true //Crea las columnas de createdAt y updatedAt
});

const Proyecto = mongoose.model("Proyectos", proyectoSchema);

export default Proyecto