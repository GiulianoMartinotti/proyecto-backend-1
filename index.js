import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import session from "express-session";
import passport from "passport";
import initializePassport from "./config/passport.js";


import productsRouter from "./routes/api/productsRouter.js";
import cartsRouter from "./routes/api/cartsRouter.js"
import viewsRouter from "./routes/views.js";
import sessionsRouter from "./routes/api/sessionsRouter.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import passwordRouter from "./routes/api/passwordRouter.js";

import { connectToMongo } from "./config/configDB.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use("/api/password", passwordRouter);

app.use((req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = decoded;
    } catch (err) {
        res.locals.user = null;
    }
    next();
});


// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);


// MongoDB
await connectToMongo();

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});