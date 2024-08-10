import { Router } from 'express';
import Cabana from '../models/cabanasModel.js';

const cabanasRouter = Router();

cabanasRouter.get('/', async (req, res) => {
    try {
        const cabanas = await Cabana.findAll();
        const plainCabanas = cabanas.map(cabana => cabana.toJSON());
        res.render('cabanas', { cabanas: plainCabanas }); // Renderizar la vista 'cabanas'
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.get('/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        const cabana = await Cabana.findByPk(numero);
        if (cabana) {
            res.json(cabana);
        } else {
            res.status(404).json({ error: 'Cabana no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


cabanasRouter.post('/', async (req, res) => {
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

// Ruta para actualizar una cabaña
cabanasRouter.post('/:id/edit', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { id } = req.params;
        const cabana = await Cabana.findByPk(id);
        if (cabana) {
            await Cabana.update(req.body, {
                where: {
                    numero: id
                }
            });
            res.status(202).json(cabana);
        } else {
            res.status(404).json({ error: 'Cabaña not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


cabanasRouter.put('/:numero', async (req, res) => {
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

cabanasRouter.get('/:numero/delete', async (req, res) => {
    try {
        const { numero } = req.params;
        const result = await Cabana.destroy({
            where: { numero }
        });
        if (result) {
            res.redirect('/cabanas'); // Redirige a la lista después de eliminar
        } else {
            res.status(404).json({ error: "Cabaña not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.delete('/:numero', async (req, res) => {
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
