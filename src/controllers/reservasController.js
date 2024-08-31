import { Router } from 'express';
import Reserva from '../models/reservasModel.js';
import Cabana from '../models/cabanasModel.js';  // Asegúrate de importar el modelo de Cabana
import PDFDocument from 'pdfkit'; 
import Cliente from '../models/clientesModel.js';
import path from 'path';
import fs from 'fs';


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

reservasRouter.get('/pdf/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Consultar la reserva y obtener los datos relacionados de la cabaña y el cliente
        const reserva = await Reserva.findByPk(id, {
            include: [
                { model: Cabana, attributes: ['numero', 'costo_diario'] },
                { model: Cliente, attributes: ['nombre', 'direccion', 'email'] }
            ]
        });

        if (!reserva) {
            return res.status(404).send('Reserva no encontrada');
        }

        // Función para formatear fechas
        const formatDate = (date) => {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return new Intl.DateTimeFormat('es-ES', options).format(date);
        };

        // Calcula los días de reserva
        const fechaInicio = new Date(reserva.fecha_inicio);
        const fechaFin = new Date(reserva.fecha_fin);
        const diasReserva = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        const costoTotal = diasReserva * reserva.Cabana.costo_diario;

        // Crear un documento PDF
        const doc = new PDFDocument({ margin: 50 });

        // Configurar el encabezado HTTP para que el archivo se descargue como PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reserva_${id}.pdf`);

        // Enviar el PDF al cliente
        doc.pipe(res);

        // Agregar la imagen
        const imagePath = path.join('./public/images/LogoCabin.png'); // Cambia el path a tu imagen
        const imageWidth = 200; // Ajusta el ancho según sea necesario
        const imageHeight = 100; // Ajusta la altura según sea necesario

        // Centrar la imagen en la página
        doc.image(imagePath, {
            fit: [imageWidth, imageHeight],
            align: 'left',
            valign: 'top'
        });

        doc.moveDown(5); // Agrega un espacio después de la imagen

        // Añadir el título
        doc.fontSize(16).text('Detalles de la Reserva', { align: 'center' });
        doc.moveDown(1); // Agrega un espacio después del título

        // Posición inicial para el recuadro
        const recuadroY = doc.y;
        const recuadroHeight = 250; // Altura del recuadro
        const recuadroWidth = doc.page.width - doc.page.margins.left * 2;

        // Dibujar recuadro
        doc.rect(doc.page.margins.left, recuadroY, recuadroWidth, recuadroHeight).stroke();

        // Configuración para el texto dentro del recuadro
        const textPadding = 10; // Espacio dentro del recuadro

        // Añadir contenido dentro del recuadro
        doc.fontSize(12);
        let yPosition = recuadroY + textPadding;

        // Función auxiliar para agregar líneas de texto
        const addTextLine = (label, value) => {
            doc.font('Helvetica-Bold').text(label, doc.page.margins.left + textPadding, yPosition);
            doc.font('Helvetica').text(value, doc.page.margins.left + textPadding + 150, yPosition);
            yPosition += 20;
        };

        // Agregar líneas de texto
        addTextLine('ID de Reserva:', reserva.numero_reserva);
        addTextLine('Cliente:', reserva.Cliente.nombre);
        addTextLine('DNI:', reserva.cliente_dni);
        addTextLine('Dirección:', reserva.Cliente.direccion);
        addTextLine('Email:', reserva.Cliente.email);
        addTextLine('Cabaña Número:', reserva.Cabana.numero);
        addTextLine('Costo Diario:', `$ ${reserva.Cabana.costo_diario}`);
        addTextLine('Fecha de Inicio:', formatDate(fechaInicio));
        addTextLine('Fecha de Fin:', formatDate(fechaFin));
        addTextLine('Días de Reserva:', `${diasReserva} días`);
        addTextLine('Costo Total:', `$ ${costoTotal}`);

        // Finalizar el documento PDF
        doc.end();

        // Manejador de errores del stream
        doc.on('error', (err) => {
            console.error('Error en el PDFKit:', err);
            res.status(500).send('Error al generar el PDF');
        });

    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
});


export default reservasRouter;