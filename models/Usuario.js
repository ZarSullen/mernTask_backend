import mongoose from "mongoose";

// Aquí implementaremos el hasheo de password con la dependencia bcrypt
import bcrypt from "bcrypt"

// Definimos el Schema, que es la forma que tendra la base de datos;

const usuarioSchema = mongoose.Schema({
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        }, 
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        token: {
            type: String,
        },
        confirmado: {
            type: Boolean,
            // El valor por default sera false
            default: false
        }
    }, 
    {
        timestamps: true//Crea las columnas de createdAt y updatedAt
    }
);
// Este codigo se ejecutara antes de almacenar el registro en la base de datos - Cuando creemos un registro este se ejecutara antes 
usuarioSchema.pre('save', async function(next) {
    // Si el password ya esta hacheado ignóralo
    if(!this.isModified('password')) { 
        next() //no ejecutes lo siguiente y mejor pasas al siguiente middleware
    }
    const salt = await bcrypt.genSalt(10);
    // Usamos this porque hará referencia al objeto del Usuario - por eso usamos function en vez de arrow function
    this.password = await bcrypt.hash(this.password, salt); 
})

// Forma para crear métodos para el modelo
usuarioSchema.methods.comprobarPassword = async function(passwordForm) {
    return await bcrypt.compare(passwordForm, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario