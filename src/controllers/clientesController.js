import { Router } from "express";
import Cliente from "../models/clientesModel.js";

const clientesRouter = Router();

clientesRouter.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        const plainClientes = clientes.map(cliente => cliente.toJSON());
        res.render('clientes', { clientes: plainClientes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

clientesRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

clientesRouter.post('/', async (req, res) => {
    try {
        const { dni, nombre, direccion, telefono, email } = req.body;
        const newCliente = await Cliente.create({
            dni,
            nombre,
            direccion,
            telefono,
            email
        });
        res.status(201).json(newCliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

clientesRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);
        if (cliente) {
            await Cliente.update(req.body, {
                where: {
                    dni: id
                }
            });
            res.status(202).json(cliente);
        } else {
            res.status(404).json({ error: 'Cliente not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

clientesRouter.post('/:id/edit', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);
        if (cliente) {
            await Cliente.update(req.body, {
                where: {
                    dni: id
                }
            });
            res.status(202).json(cliente);
        } else {
            res.status(404).json({ error: 'Cliente not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
clientesRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Cliente.destroy({
            where: { dni: id }
        });
        if (result) {
            res.redirect('/clientes'); // Redirige a la lista después de eliminar
        } else {
            res.status(404).json({ error: "Cliente not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar cliente
clientesRouter.get('/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Cliente.destroy({
            where: { dni: id }
        });
        if (result) {
            res.redirect('/clientes'); // Redirige a la lista después de eliminar
        } else {
            res.status(404).json({ error: "Cliente not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default clientesRouter;
