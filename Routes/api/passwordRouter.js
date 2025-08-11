import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../../models/user.js";
import { createHash, isValidPassword } from "../../utils/bcrypt.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";


dotenv.config();

const router = Router();
const { APP_URL, JWT_RESET_SECRET, RESET_TOKEN_EXPIRES = "1h" } = process.env;

// POST /api/password/forgot  -> envía mail
router.post('/forgot', async (req, res) => {
    try {
        const { email } = req.body;
        // Respondemos igual aunque no exista para no filtrar usuarios
        const user = await User.findOne({ email });

        // token válido 1h 
        if (user) {
            // payload CONSISTENTE
            const token = jwt.sign(
                { uid: user._id, scope: "pwdreset" },
                JWT_RESET_SECRET,
                { expiresIn: RESET_TOKEN_EXPIRES }
            );

            // baseUrl confiable
            const baseUrl = APP_URL || `${req.protocol}://${req.get("host")}`;
            const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

            await sendPasswordResetEmail(email, resetLink);
        }

        return res.json({ status: 'success', message: 'Si el correo existe, te enviamos un link.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', error: 'Error enviando el mail' });
    }
});

// POST /api/password/reset  -> cambia la contraseña
router.post("/reset", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ status: "error", message: "Datos faltantes" });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_RESET_SECRET);
        } catch {
            return res.status(400).json({ status: "error", message: "Token inválido o expirado" });
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

        res.json({ status: "success", message: "Contraseña actualizada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Error al restablecer" });
    }
});

export default router;