import { Router } from 'express';
import { Op } from 'sequelize'; // Importa Op aquí
import Cliente from '../models/clientesModel.js';
import Cabana from '../models/cabanasModel.js';
import Reserva from '../models/reservasModel.js';

const busquedaRouter = Router();

// Ruta para mostrar la vista de búsqueda general
busquedaRouter.get('/', (req, res) => {
    res.render('busqueda');
});

// Búsqueda de clientes por nombre
busquedaRouter.get('/clientes', async (req, res) => {
    const { nombre } = req.query;
    try {
        const clientes = await Cliente.findAll({ where: { nombre: { [Op.like]: `%${nombre}%` } } });
        res.json({ clientes });
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar clientes' });
    }
});

// Búsqueda de cabañas disponibles por fecha

busquedaRouter.get('/cabanas', async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;
    try {
        // Obtener todas las cabañas
        const cabañas = await Cabana.findAll();
        
        // Filtrar las cabañas ocupadas en el rango de fechas solicitado
        const reservas = await Reserva.findAll({
            where: {
                [Op.or]: [
                    {
                        fecha_inicio: {
                            [Op.between]: [fecha_inicio, fecha_fin]
                        }
                    },
                    {
                        fecha_fin: {
                            [Op.between]: [fecha_inicio, fecha_fin]
                        }
                    },
                    {
                        fecha_inicio: {
                            [Op.lte]: fecha_inicio
                        },
                        fecha_fin: {
                            [Op.gte]: fecha_fin
                        }
                    }
                ]
            }
        });

        // Obtener los IDs de las cabañas ocupadas
        const cabañasOcupadas = reservas.map(reserva => reserva.cabana_numero);
        
        // Filtrar las cabañas libres
        const cabañasLibres = cabañas.filter(cabana => !cabañasOcupadas.includes(cabana.numero));

        // Enviar el resultado en formato JSON
        res.json({ cabanas: cabañasLibres });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default busquedaRouter;
