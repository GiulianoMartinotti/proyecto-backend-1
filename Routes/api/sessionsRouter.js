import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = '1d';

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

        res.cookie('jwtCookie', token, {
            httpOnly: true,
            secure: false, // Cambiar a true si usás HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 1 día
        });

        res.send({
            status: "success",
            message: "Login exitoso",
            token
        });
    }
);


// Ruta de error para registro fallido
router.get("/failRegister", (req, res) => {
    res.status(400).send({ error: "Fallo el registro" });
});

// Ruta de error para login fallido
router.get("/failLogin", (req, res) => {
    res.status(401).send({ error: "Login incorrecto" });
});


// Ruta protegida con JWT
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.send({
            status: "success",
            payload: req.user
        });
    }
);

export default router;