import { Router } from "express";
import dotenv from "dotenv";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../../dto/userDTO.js";
import { authJwt } from "../../middlewares/auth.js";

dotenv.config();


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = '1hr';

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 // 1 hora
};


// Registro (con passport-local)
router.post(
    "/register",
    passport.authenticate("register", {
        failureRedirect: "/failRegister",
        failureMessage: true,
    }),
    (req, res) => {
        res.redirect("/login");
    }
);

// Login
router.post(
    "/login",
    passport.authenticate("login", {
        failureRedirect: "/failLogin",
        failureMessage: true,
    }),
    (req, res) => {
        const user = req.user;

        const payload = {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role || "user"
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

        res
            .cookie("token", token, cookieOpts)
            .status(200)
            .json({ status: "success", message: "Login exitoso" }); // ← no exponemos el token
    }
);

// Logout: limpia cookie
router.post("/logout", (req, res) => {
    res.clearCookie("token", cookieOpts);
    res.status(200).json({ status: "success", message: "Sesión cerrada" });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token", cookieOpts);
    res.redirect("/login");
});


// Ruta de error para registro fallido
router.get("/failRegister", (req, res) => {
    res.status(400).send({ error: "Fallo el registro" });
});

// Ruta de error para login fallido
router.get("/failLogin", (req, res) => {
    res.status(401).send({ error: "Login incorrecto" });
});


// Ruta protegida con JWT
// /current: SOLO DTO no sensible
router.get("/current", authJwt, (req, res) => {
    const dto = new UserDTO(req.user);
    // Evitar caching de info de usuario
    res.set("Cache-Control", "no-store");
    res.send({ status: "success", payload: dto });
});


export default router;