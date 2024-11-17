import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
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
        await Usuario.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
        });

        res.status(200).json({ success: 'Registro exitoso. Redirigiendo...' });
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error en el servidor. Inténtalo nuevamente.' });
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
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Responder con éxito
        res.status(200).json({ success: 'Inicio de sesión exitoso. Redirigiendo...' });
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error en el servidor. Inténtalo nuevamente.' });
    }
});

//Vista de documentación
usuariosRouter.get('/documentacion', (req, res) => {
    res.render('documentacion');
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

        // Buscar el usuario actual en la base de datos
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Si el usuario proporcionó una nueva contraseña, verificar y actualizarla
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Las contraseñas no coinciden' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        // Si se subió una nueva foto de perfil
        if (req.file) {
            // Eliminar la imagen anterior de Cloudinary si existe
            if (usuario.foto_perfil_public_id) {
                await cloudinary.v2.uploader.destroy(usuario.foto_perfil_public_id);
            }

            // Actualizar la URL de la nueva imagen y el public_id en los datos a actualizar
            updatedData.foto_perfil = req.file.path; // URL de la nueva imagen
            updatedData.foto_perfil_public_id = req.file.filename; // Public ID de la nueva imagen
        }

        // Actualizar el usuario en la base de datos
        await Usuario.update(updatedData, { where: { id } });

        // Generar un nuevo token JWT con los datos actualizados
        const newToken = jwt.sign({ 
            id: usuario.id, 
            nombre: updatedData.nombre, 
            apellido: updatedData.apellido, 
            foto_perfil: updatedData.foto_perfil || usuario.foto_perfil, 
            email: usuario.email 
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Establecer el nuevo token en una cookie
        res.cookie('token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Redirigir a la página del perfil después de la actualización
        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default usuariosRouter;
