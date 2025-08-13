import jwt from "jsonwebtoken";
import passport from "passport";

export const requireAuth = passport.authenticate("jwt", { session: false });

export const authorize = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ status: "error", message: "No autenticado" });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ status: "error", message: "No autorizado" });
    }
    next();
};


function getTokenFromRequest(req) {
    // Cookie
    const cookieToken = req.cookies?.token;
    if (cookieToken) return cookieToken;

    // Header Authorization
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
        return auth.substring("Bearer ".length).trim();
    }

    return null;
}

export function authJwt(req, res, next) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ error: "No autenticado: token ausente" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: "Falta JWT_SECRET en .env" });
        }

        const payload = jwt.verify(token, secret);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

/**
 * Middleware de autenticación opcional.
 * Si hay token válido, setea req.user; si no, sigue sin romper.
 */
export function authOptional(req, res, next) {
    try {
        const token = getTokenFromRequest(req);
        const secret = process.env.JWT_SECRET;

        if (token && secret) {
            const payload = jwt.verify(token, secret);
            req.user = payload;
        }
    } catch {
        // Silencioso: si el token está mal, seguimos sin usuario.
    }
    next();
}

/**
 * Middleware de autorización por roles.
 * Uso: authorizeRoles('admin') o authorizeRoles('user', 'admin')
 */
export function authorizeRoles(...allowed) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        next();
    };
}

// Requiere login para vistas (redirige a /login)
export function requireLoginView(req, res, next) {
    if (res.locals.user) return next();
    return res.redirect("/login");
}