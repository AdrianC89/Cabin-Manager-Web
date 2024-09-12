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
            res.status(404).json({ error: 'Reserva no encontrada' });
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
        // Obtener el usuario logueado desde el objeto user inyectado por el middleware injectUserData
        const user = req.user || res.locals.user;

        if (!user) {
            console.error('User data not found in request or response locals');
            return res.status(500).send('Error: User data is missing');
        }

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

        // Formato de fecha
        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = ('0' + date.getUTCDate()).slice(-2);
            const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        }

        // Calcular los días de reserva y el costo total
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

        // Añadir el logo alineado a la izquierda
        const imagePath = path.join('./public/images/LogoCabin.png'); // Cambia el path a tu imagen
        const imageWidth = 150; // Ajusta el ancho según sea necesario
        const imageHeight = 75; // Ajusta la altura según sea necesario
        doc.image(imagePath, doc.page.margins.left, 10, { fit: [imageWidth, imageHeight] });

        // Añadir el nombre del usuario logueado alineado a la derecha
        doc.fontSize(8)
            .text(`Reserva gestionada por: ${user.nombre} ${user.apellido}`,
                doc.page.width - 220, 50); // Ajusta 200 según el espacio disponible

        doc.moveDown(4); // Espacio después del encabezado

        // Añadir el título más a la izquierda con subrayado
        const titleX = doc.page.margins.left; // Ajusta la posición X según sea necesario
        const titleText = 'DETALLES DE LA RESERVA';
        const titleWidth = doc.widthOfString(titleText);

        doc.fontSize(15).fillColor('black')
            .text(titleText, titleX, doc.y);

        doc.moveDown(1);
        // Posición inicial para el recuadro
        const recuadroY = doc.y;
        const recuadroHeight = 250; // Altura del recuadro
        const recuadroWidth = doc.page.width - doc.page.margins.left * 2;

        // Dibujar recuadro con color de borde negro
        doc.rect(doc.page.margins.left, recuadroY, recuadroWidth, recuadroHeight)
            .lineWidth(2)
            .strokeColor('black')
            .stroke();

        // Configuración para el texto dentro del recuadro
        const textPadding = 10; // Espacio dentro del recuadro
        let yPosition = recuadroY + textPadding;

        // Función auxiliar para agregar líneas de texto
        const addTextLine = (label, value) => {
            doc.font('Helvetica-Bold').fontSize(12).text(label, doc.page.margins.left + textPadding, yPosition);
            doc.font('Helvetica').fontSize(12).text(value, doc.page.margins.left + textPadding + 150, yPosition);
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
        addTextLine('Check In:', formatDate(fechaInicio));
        addTextLine('Check Out:', formatDate(fechaFin));
        addTextLine('Días de Reserva:', `${diasReserva} días`);
        addTextLine('Costo Total:', `$ ${costoTotal}`);


        doc.moveDown(5);

        // Añadir pie de página que se mantiene en la parte inferior de la página
        doc.on('pageAdded', () => {
            doc.fontSize(10)
                .text('Este documento fue generado automáticamente por el sistema de reservas.', {
                    align: 'left',
                    baseline: 'bottom'
                });
        });

        // Llama al pie de página en la página actual
        doc.fontSize(10)
            .text('Generado automáticamente por Cabin Manager.', {
                align: 'left',
                baseline: 'bottom',
                pageBreak: true
            });

        // Añadir fecha al pie de página
        doc.fontSize(10)
            .text(`Fecha de Generación: ${formatDate(new Date())}`, {
                align: 'left',
                baseline: 'bottom',
                pageBreak: true
            });

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
