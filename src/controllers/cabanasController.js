import { Router } from 'express';
import Cabana from '../models/cabanasModel.js';

const cabanasRouter = Router();

cabanasRouter.get('/', async (req, res) => {
    try {
        const cabanas = await Cabana.findAll();
        const cabanasTransformadas = cabanas.map(cabana => ({
            numero: cabana.numero,
            capacidad: cabana.capacidad,
            descripcion: cabana.descripcion,
            costo_diario: cabana.costo_diario ? parseFloat(cabana.costo_diario) : 0 // Convierte a número o usa 0 si es nulo
        }));
        res.render('cabanas', { cabanas: cabanasTransformadas });
    } catch (error) {
        console.error("Error al obtener las cabañas:", error);
        res.status(500).send("Error al obtener la lista de cabañas");
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
        console.log('Datos recibidos en el servidor:', req.body);

        const { numero, capacidad, descripcion, costo_diario } = req.body;

        // Convertir costo_diario a un número entero
        const costo_diario_entero = Math.round(parseFloat(costo_diario.replace(/[^0-9.-]+/g, '')) * 100);

        const newCabana = await Cabana.create({
            numero,
            capacidad,
            descripcion,
            costo_diario: costo_diario_entero
        });

        res.status(201).json(newCabana);
    } catch (error) {
        console.error('Error al crear la cabaña:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar una cabaña

cabanasRouter.post('/:id/edit', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { id } = req.params; // Obtener el ID de la cabaña
        const { capacidad, descripcion, costo_diario } = req.body; // Extraer los datos del cuerpo

        const cabana = await Cabana.findByPk(id); // Buscar la cabaña por su ID
        if (cabana) {
            // Convertir el costo a un número entero si se proporciona
            const costo_diario_entero = costo_diario 
                ? Math.round(parseFloat(costo_diario.replace(/[^0-9.-]+/g, '')))
                : cabana.costo_diario; // Si no se envía, mantener el valor actual

            // Actualizar la cabaña con los datos recibidos
            await Cabana.update(
                {
                    capacidad,
                    descripcion,
                    costo_diario: costo_diario_entero
                },
                { where: { numero: id } }
            );

            // Responder con éxito
            res.status(202).json({ message: 'Cabaña actualizada exitosamente' });
        } else {
            res.status(404).json({ error: 'Cabaña no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar la cabaña:', error);
        res.status(500).json({ error: error.message });
    }
});

cabanasRouter.put('/:numero', async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);

        const { numero } = req.params;
        const { capacidad, descripcion, costo_diario } = req.body;

        const cabana = await Cabana.findByPk(numero);
        if (cabana) {
            // Convertir costo_diario a un número entero
            const costo_diario_entero = Math.round(parseFloat(costo_diario.replace(/[^0-9.-]+/g, '')) * 100);

            await Cabana.update(
                {
                    capacidad,
                    descripcion,
                    costo_diario: costo_diario_entero
                },
                {
                    where: { numero }
                }
            );

            res.status(202).json({ message: 'Cabaña actualizada' });
        } else {
            res.status(404).json({ error: 'Cabaña no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar la cabaña:', error);
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