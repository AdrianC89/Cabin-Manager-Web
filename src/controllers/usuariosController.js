import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuariosModel.js';
import { upload } from '../middlewares/cloudinary.js'; // Importa upload

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

        res.redirect('/');
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
        const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, foto_perfil: usuario.foto_perfil, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Establecer el token en una cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Ajusta opciones según sea necesario

        // Redirigir a la vista de administración
        res.redirect('/admin');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Vista de panel de administración
usuariosRouter.get('/admin', (req, res) => {
    res.render('panel-admin');
});

//Cerrar Sesión
usuariosRouter.get('/logout', (req, res) => {
    res.clearCookie('token'); // Elimina la cookie del token
    res.redirect('/login'); // Redirige a la página de inicio de sesión
});

// Obtener perfil de usuario
usuariosRouter.get('/profile', async (req, res) => {
    try {
        const { id } = res.locals.user; // Usar res.locals.user en lugar de req.user
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.render('profile', { usuario }); // Renderiza la vista con los datos del usuario
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

usuariosRouter.post('/profile/edit', upload.single('foto_perfil'), async (req, res) => {
    try {
        const { id } = res.locals.user;
        const { nombre, apellido, password, confirmPassword } = req.body;
        let updatedData = { nombre, apellido };

        // Si el usuario proporcionó una nueva contraseña, verificar y actualizarla
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Las contraseñas no coinciden' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        // Si se subió una nueva foto de perfil, actualizar la URL de la imagen
        if (req.file) {
            updatedData.foto_perfil = req.file.path; // Cloudinary guarda la URL de la imagen en req.file.path
        }

        // Actualizar el usuario en la base de datos
        await Usuario.update(updatedData, { where: { id } });

        // Redirigir a la página del perfil después de la actualización
        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default usuariosRouter;
