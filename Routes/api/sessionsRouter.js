import { Router } from "express";
import dotenv from "dotenv";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../../dto/userDTO.js";
import { authJwt } from "../../middlewares/auth.js";

dotenv.config();


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

        res
            .cookie("token", token, {
                httpOnly: true,
                // secure: true, 
                maxAge: 1000 * 60 * 60 // 1 hora
            })
            .status(200)
            .json({ message: "Login exitoso", token });
    }
);

// Logout: limpia cookie
router.get("/logout", (req, res) => {
    res.clearCookie("token");
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
router.get(
    "/current",
    authJwt,
    (req, res) => {
        const dto = new UserDTO(req.user);
        res.send({ status: "success", payload: dto });
    }
);


export default router;