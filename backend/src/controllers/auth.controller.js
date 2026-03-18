import * as userService from "../services/user.service.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

export const register = async (req, res) => {
    try {
        const { username, password, name } = req.body;

        // Validar si ya existe
        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "El nombre de usuario ya esta en uso" });
        }

        // Encriptar la password
        const hashedPassword = await hashPassword(password);

        // Crear usuario
        const newUser = await userService.createUser(
            username,
            hashedPassword,
            name,
        );

        // Generar token
        const token = generateToken(newUser);

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const user = await userService.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: "Credenciales invalidas" });
        }

        // Comparar password
        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales invalidas" });
        }

        // Genera token y devolver info (sin password)
        const token = generateToken(user);
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesion" });
    }
};

export const getProfile = async (req, res) => {
    try {
        // req.user viene del middleware authenticateToken
        const user = await userService.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener perfil" });
    }
};
