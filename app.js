import express from 'express';
import sequelize from './src/database/connect.js';
import bodyParser from 'body-parser';
import path from 'path'; // Asegúrate de importar el módulo path


// Importar modelos para la sincronización
import './src/models/clientesModel.js';
import './src/models/cabanasModel.js';
import './src/models/reservasModel.js';

// Importación de controladores
import clientesRouter from './src/controllers/clientesController.js';
import cabanasRouter from './src/controllers/cabanasController.js';
import reservasRouter from './src/controllers/reservasController.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(path.resolve(), 'public')));

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

// Usar controladores
app.use(clientesRouter);
app.use(cabanasRouter);
app.use(reservasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en ${PORT}`);
});
