import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    // Formato esperado: "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ error: "Acceso denegado. Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token invalido o expirado" });
    }
};
