import { Router } from 'express';
import Cabana from '../models/cabanasModel.js';

const cabanasRouter = Router();

cabanasRouter.get('/cabanas', async (req, res) => {
    try {
        const cabanas = await Cabana.findAll();
        const plainCabanas = cabanas.map(cabana => cabana.toJSON());
        res.render('cabanas', { cabanas: plainCabanas }); // Renderizar la vista 'cabanas'
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.get('/cabanas/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        const cabana = await Cabana.findByPk(numero);
        if (cabana) {
            res.render('cabana', { cabana: cabana.toJSON() }); // Renderizar la vista 'cabana'
        } else {
            res.status(404).json({ error: 'Cabaña no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.post('/cabanas', async (req, res) => {
    try {
        const { numero, capacidad, descripcion, costo_diario } = req.body;
        const newCabana = await Cabana.create({
            numero,
            capacidad,
            descripcion,
            costo_diario
        });
        res.status(201).json(newCabana);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.put('/cabanas/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        const cabana = await Cabana.findByPk(numero);
        if (cabana) {
            await Cabana.update(req.body, {
                where: { numero }
            });
            res.status(202).json(cabana);
        } else {
            res.status(404).json({ error: 'Cabaña no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.delete('/cabanas/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        console.log(`Attempting to delete cabaña with numero: ${numero}`);
        const result = await Cabana.destroy({
            where: { numero }
        });
        console.log(`Delete result: ${result}`);
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "Cabaña no encontrada" });
        }
    } catch (error) {
        console.error(`Error deleting cabaña: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

export default cabanasRouter;
