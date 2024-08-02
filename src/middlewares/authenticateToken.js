import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const authenticateToken = (req, res, next) => {
    // Obtener el token de las cookies
    const token = req.cookies.token;
    
    if (!token) return res.sendStatus(401); // Si no hay token, retornar error

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token inválido

        req.user = user; // Almacenar los datos del usuario en la solicitud
        next();
    });
};

export default authenticateToken;
