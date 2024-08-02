import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuariosModel.js';

const usuariosRouter = Router();

usuariosRouter.get('/register', (req, res) => {
    res.render('register');
});

usuariosRouter.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, email, password, confirmPassword } = req.body;

        // Verificar que las contraseñas coinciden
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        // Verificar que el email no esté registrado
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
        });

        res.status(201).json(newUsuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Inicio de sesión
usuariosRouter.get('/login', (req, res) => {
    res.render('login');
});
usuariosRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Establecer el token en una cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Ajusta opciones según sea necesario

        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener perfil de usuario
usuariosRouter.get('/profile', async (req, res) => {
  try {
    const { id } = req.user; // Asegúrate de tener middleware de autenticación que establezca req.user
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default usuariosRouter;
