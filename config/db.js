import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        const url = `${connection.connection.host}:${connection.connection.port}`;

        console.log(`MongoDb conectado en: ${url}`)
    } catch (error) {
        console.log(`error: ${error.message}`)
        // Node termina los procesos con 0 al colocar el 1 el process.exit es para forzar que los procesos terminen
        process.exit(1)
    }
}


export default connectDB