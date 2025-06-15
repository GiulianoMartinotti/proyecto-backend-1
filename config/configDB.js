import mongoose from "mongoose";

export const connectToMongo = async () => {
    try {
        await mongoose.connect("mongodb+srv://Giuliano:amLMRAXGKpyCI7P9@coderbackend.ymytpgl.mongodb.net/app");
        console.log("✅ Conectado a MongoDB");
    } catch (err) {
        console.error("❌ Error conectando a MongoDB:", err);
        process.exit(1);
    }
};