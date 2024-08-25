import { Router } from 'express';
import Reserva from '../models/reservasModel.js';
import Cabana from '../models/cabanasModel.js';  // Asegúrate de importar el modelo de Cabana


const reservasRouter = Router();

// Obtener todas las reservas con datos de Cabana
reservasRouter.get('/', async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            include: [{ model: Cabana, attributes: ['costo_diario'] }]
        });
        
        const reservasConDetalles = reservas.map(reserva => {
            const fechaInicio = new Date(reserva.fecha_inicio);
            const fechaFin = new Date(reserva.fecha_fin);
            const diasReserva = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
            const costoTotal = diasReserva * reserva.Cabana.costo_diario;
            
            return {
                ...reserva.toJSON(),
                diasReserva,
                costoTotal
            };
        });

        res.render('reservas', { reservas: reservasConDetalles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findByPk(id);
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
reservasRouter.post('/', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, cliente_dni, cabana_numero } = req.body;
        const newReserva = await Reserva.create({
            fecha_inicio,
            fecha_fin,
            cliente_dni,
            cabana_numero
        });
        const plainReserva = newReserva.toJSON();
        res.status(201).json(plainReserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.post('/:id/edit', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { id } = req.params;
        const reserva = await Reserva.findByPk(id);
        if (reserva) {
            await Reserva.update(req.body, {
                where: {
                    numero_reserva: id
                }
            });
            res.status(202).json(reserva);
        } else {
            res.status(404).json({ error: 'Reserva not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
reservasRouter.put('/:numero_reserva', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        const reserva = await Reserva.findByPk(numero_reserva);
        if (reserva) {
            await Reserva.update(req.body, {
                where: { numero_reserva }
            });
            const updatedReserva = await Reserva.findByPk(numero_reserva);
            const plainReserva = updatedReserva.toJSON();
            res.status(202).json(plainReserva);
        } else {
            res.status(404).json({ error: 'Reserva no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.get('/:numero_reserva/delete', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        const result = await Reserva.destroy({
            where: { numero_reserva }
        });
        if (result) {
            res.redirect('/reservas'); // Redirige a la lista después de eliminar
        } else {
            res.status(404).json({ error: "Reserva not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.delete('/:numero_reserva', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        const result = await Reserva.destroy({
            where: { numero_reserva }
        });
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "Reserva no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default reservasRouter;