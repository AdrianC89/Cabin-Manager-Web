import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const injectUserData = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) {
                res.locals.user = user; // Almacena el usuario en res.locals
            }
        });
    } else {
        res.locals.user = null; // Si no hay token, no hay usuario autenticado
    }
    next();
};

export default injectUserData;
