import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Encriptar la contraseña
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Comparar constraseña (login)
export const comparePassword = async (password, storedHash) => {
    return await bcrypt.compare(password, storedHash);
};

// Generar token
export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }, // EL token dura 7 dias
    );
};
