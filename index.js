import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/api/productsRouter.js"; // Nuevo
import cartsRouter from "./routes/api/cartsRouter.js";
import viewsRouter from "./routes/views.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter); 
app.use("/", viewsRouter);


// MongoDB
import { connectToMongo } from "./config/configDB.js";
await connectToMongo();

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});