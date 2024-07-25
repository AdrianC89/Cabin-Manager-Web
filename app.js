import express from 'express';
import sequelize from './src/database/connect.js';
import bodyParser from 'body-parser';

// Importar modelos para la sincronización
import './src/models/clientesModel.js'
import './src/models/cabanasModel.js'
import './src/models/reservasModel.js'

// Importación de controladores
import clientesRouter from './src/controllers/clientesController.js';
import cabanasRouter from './src/controllers/cabanasController.js';
import reservasRouter from './src/controllers/reservasController.js';


const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.get('/', (req, res) => {
    res.json({ message: 'todo ok' });
});

app.use(clientesRouter);
app.use(cabanasRouter);
app.use(reservasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en ${PORT}`);
});
