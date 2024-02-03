// Aqui tendremos la configuración del servidor
// const express =  require("express") //Asi se hace con common JS
// Para cambiar de common JS a modulos en el package.json se agrega el "type": "modules"
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
import cors from "cors";

// Cada una de estas lineas es un middleware se van ejecutando una linea luego se pasa a la siguiente y tal

const app = express();
// Para que pueda leer la info que viene como Json
app.use(express.json());

dotenv.config()

connectDB();    

// Cors para permitir las acciones desde el dominio del frontend

// Define un array de dominios permitidos (whitelist)
const whitelist = [process.env.FRONTEND_URL];
// Configura las opciones de CORS
const corsOptions = {
    origin: function(origin, callback) {
        // Comprueba si el origen (host que envía la solicitud) está en la lista blanca
        if(whitelist.includes(origin)) {
            // SI el origin que es el host que esta mandando la petición, esta incluido en el whitelist, puede consultar el api

            // Permitido, no le damos ningún error, y le permitimos el acceso
            callback(null, true)
        } else {
            // Request no permitido // Le damos un error
            callback(new Error("Error de Cors"))
        }
    }
}

app.use(cors(corsOptions));

// Routing : Cuando entramos a una pagina hacemos una petición tipo get entonces definimos el routin para que lo soporte
// también podría ser .use y este responde a todos los verbos http
// creamos la ruta para la api de usuarios y creamos la carpeta de ruta donde soportara todos los verbos http usamos .use
app.use('/api/usuarios', usuarioRoutes)  // index > routes > controllers
app.use('/api/proyectos', proyectoRoutes)  // index > routes > controllers
app.use('/api/tareas', tareaRoutes)  // index > routes > controllers


// PORT se crea automaticamente en el servidor
const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    // Una vez que estemos en el deployment nos asignaran el puerto que este libre
    console.log(`servidor Corriendo en puerto ${PORT}`)
});

// Socket.io
import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
});

io.on("connection", (socket) => {
    console.log("Conectado a socket.io")

    // Definir los eventos de socket.io

    socket.on("abrir proyecto", (proyecto) => {
        socket.join(proyecto);
    });

    socket.on("crear tarea", (tarea) => {
        // emitira este nuevo evento a la persona que tenga abierto este proyecto (tarea.proyecto es el id del proyecto)
        socket.to(tarea.proyecto).emit("tarea agregada", tarea)
    })

    socket.on("borrar tarea", tarea => {
        socket.to(tarea.proyecto).emit("eliminar tarea", tarea)
    })

    socket.on("editar tarea", tarea => {
        socket.to(tarea.proyecto._id).emit("tarea editada", tarea)
    })

    socket.on("completar tarea", tarea => {
        socket.to(tarea.proyecto._id).emit("tarea completada", tarea)
    })
});


