import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser'; // Importar cookie-parser
import sequelize from './src/database/connect.js';
import bodyParser from 'body-parser';
import path from 'path'; 



// Importar modelos para la sincronización
import './src/models/clientesModel.js';
import './src/models/cabanasModel.js';
import './src/models/reservasModel.js';
import './src/models/usuariosModel.js'; 

// Importación de controladores
import clientesRouter from './src/controllers/clientesController.js';
import cabanasRouter from './src/controllers/cabanasController.js';
import reservasRouter from './src/controllers/reservasController.js';
import usuariosRouter from './src/controllers/usuariosController.js';
import busquedaRouter from './src/controllers/busquedaController.js';

// Importar el middleware de autenticación
import authRequired from './src/middlewares/authenticateToken.js'; // Cambia esto si usas cookies
import injectUserData from './src/middlewares/injectUserData.js';


const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Usa cookie-parser para manejar cookies

// Aplicar el middleware para inyectar datos del usuario en todas las vistas
app.use(injectUserData);

// Configuración para servir archivos estáticos
app.use(express.static(path.join(path.resolve(), 'public')));

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use('/docs', express.static('public/docs'));

// Configuración del motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views')); // Establece el directorio de vistas

// Ruta para renderizar el index.ejs
app.get('/', (req, res) => {
    res.render('index'); // Renderiza el archivo index.ejs
});

// Conectar a la base de datos
(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.use('/', usuariosRouter);

// Aplicar el middleware de autenticación a las rutas que deseas proteger
app.use('/clientes', authRequired, clientesRouter);
app.use('/cabanas', authRequired, cabanasRouter);
app.use('/reservas', authRequired, reservasRouter);
app.use('/buscar', authRequired, busquedaRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en ${PORT}`);
});
