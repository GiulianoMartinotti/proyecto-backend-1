// routes/api/passwordRouter.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../../models/user.js";
import { createHash, isValidPassword } from "../../utils/bcrypt.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";

dotenv.config();

const router = Router();

const {
    APP_URL,
    JWT_SECRET,               
    JWT_RESET_SECRET,         
    RESET_TOKEN_EXPIRES = "1h"
} = process.env;


const RESET_SECRET = JWT_RESET_SECRET || JWT_SECRET;


function getBaseUrl(req) {
    return APP_URL || `${req.protocol}://${req.get("host")}`;
}

// POST /api/password/forgot  
router.post("/forgot", async (req, res) => {
    try {
        const { email } = req.body || {};
        
        const user = email ? await User.findOne({ email }).lean() : null;

        if (!RESET_SECRET) {
            console.error("[forgot] Falta RESET_SECRET (JWT_RESET_SECRET o JWT_SECRET) en .env");
            return res.json({ status: "success", message: "Si el correo existe, te enviamos un link." });
        }

        if (user) {
            const token = jwt.sign(
                { uid: user._id, scope: "pwdreset" },
                RESET_SECRET,
                { expiresIn: RESET_TOKEN_EXPIRES } // 
            );

            const resetLink = `${getBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;
            try {
                await sendPasswordResetEmail(email, resetLink);
            } catch (mailErr) {
                console.error("[forgot] Error enviando email:", mailErr);
            }
        }

        return res.json({ status: "success", message: "Si el correo existe, te enviamos un link." });
    } catch (err) {
        console.error("[forgot] error:", err);
        return res.status(500).json({ status: "error", error: "Error enviando el mail" });
    }
});

// POST /api/password/reset
router.post("/reset", async (req, res) => {
    try {
        const { token, password } = req.body || {};
        if (!token || !password) {
            return res.status(400).json({ status: "error", message: "Token y contraseña requeridos" });
        }
        if (!RESET_SECRET) {
            return res.status(500).json({ status: "error", message: "Secreto JWT no configurado" });
        }

        let payload;
        try {
            payload = jwt.verify(token, RESET_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ status: "error", message: "Token expirado. Solicitá uno nuevo." });
            }
            return res.status(401).json({ status: "error", message: "Token inválido o expirado" });
        }

        if (payload.scope !== "pwdreset") {
            return res.status(400).json({ status: "error", message: "Token inválido" });
        }

        const user = await User.findById(payload.uid);
        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        // No permitir reutilizar la misma contraseña
        if (isValidPassword(user, password)) {
            return res.status(400).json({
                status: "error",
                message: "La nueva contraseña no puede ser igual a la anterior",
            });
        }

        user.password = createHash(password);
        await user.save();

        return res.json({ status: "success", message: "Contraseña actualizada" });
    } catch (err) {
        console.error("[reset] error:", err);
        return res.status(500).json({ status: "error", message: "Error al restablecer" });
    }
});

export default router;
