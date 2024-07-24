import { Router } from "express";
import Cliente from "../models/clientesModel.js";

const clientesRouter = Router();

clientesRouter.get('/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.findAll()
        res.json(clientes)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

clientesRouter.get('/clientes/:id', async (req, res) => {
    try {
        const {id} = req.params
        const cliente = await Cliente.findByPk(id)
        res.json(cliente)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

clientesRouter.post('/clientes', async (req, res) => {
    try {
        const { dni, nombre, direccion, telefono, email } = req.body
        const newCliente = await Cliente.create({
            dni,
            nombre,
            direccion,
            telefono,
            email
        })
        res.status(201).json(newCliente)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

clientesRouter.put('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params
        const cliente = await Cliente.findByPk(id)
        if (cliente) {
            await Cliente.update(req.body, {
                where: {
                    dni: id
                }
            })
            res.status(202).json(cliente)
        } else {
            res.status(404).json({ error: 'Cliente not found' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


clientesRouter.delete('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete cliente with DNI: ${id}`);
        const result = await Cliente.destroy({
            where: { dni: id }
        });
        console.log(`Delete result: ${result}`);
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "cliente not found" });
        }
    } catch (error) {
        console.error(`Error deleting cliente: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
})

export default clientesRouter