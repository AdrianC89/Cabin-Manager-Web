import { Router } from "express";
import Reserva from "../models/reservasModel.js";

const reservasRouter = Router();

reservasRouter.get('/reservas', async (req, res) => {
    try {
        const reservas = await Reserva.findAll();
        const formattedReservas = reservas.map(reserva => ({
            ...reserva.toJSON(),
            fecha_inicio: reserva.fecha_inicio.toISOString().split('T')[0],
            fecha_fin: reserva.fecha_fin.toISOString().split('T')[0],
        }));
        res.json(formattedReservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.get('/reservas/:numero_reserva', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        const reserva = await Reserva.findByPk(numero_reserva);
        if (reserva) {
            const formattedReserva = {
                ...reserva.toJSON(),
                fecha_inicio: reserva.fecha_inicio.toISOString().split('T')[0],
                fecha_fin: reserva.fecha_fin.toISOString().split('T')[0],
            };
            res.json(formattedReserva);
        } else {
            res.status(404).json({ error: 'Reserva no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.post('/reservas', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, cliente_dni, cabana_numero } = req.body;
        const newReserva = await Reserva.create({
            fecha_inicio,
            fecha_fin,
            cliente_dni,
            cabana_numero
        });
        const formattedReserva = {
            ...newReserva.toJSON(),
            fecha_inicio: newReserva.fecha_inicio.toISOString().split('T')[0],
            fecha_fin: newReserva.fecha_fin.toISOString().split('T')[0],
        };
        res.status(201).json(formattedReserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.put('/reservas/:numero_reserva', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        const reserva = await Reserva.findByPk(numero_reserva);
        if (reserva) {
            await Reserva.update(req.body, {
                where: { numero_reserva }
            });
            const updatedReserva = await Reserva.findByPk(numero_reserva);
            const formattedReserva = {
                ...updatedReserva.toJSON(),
                fecha_inicio: updatedReserva.fecha_inicio.toISOString().split('T')[0],
                fecha_fin: updatedReserva.fecha_fin.toISOString().split('T')[0],
            };
            res.status(202).json(formattedReserva);
        } else {
            res.status(404).json({ error: 'Reserva no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

reservasRouter.delete('/reservas/:numero_reserva', async (req, res) => {
    try {
        const { numero_reserva } = req.params;
        console.log(`Attempting to delete reserva with numero_reserva: ${numero_reserva}`);
        const result = await Reserva.destroy({
            where: { numero_reserva }
        });
        console.log(`Delete result: ${result}`);
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "Reserva no encontrada" });
        }
    } catch (error) {
        console.error(`Error deleting reserva: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

export default reservasRouter;
