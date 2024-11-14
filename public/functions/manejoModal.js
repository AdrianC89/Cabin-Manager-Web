document.addEventListener('DOMContentLoaded', function () {
    var confirmationModal = document.getElementById('confirmationModal');
    var confirmDeleteButton = document.getElementById('confirmDeleteButton');
    var editModal = document.getElementById('editModal');
    var editForm = document.getElementById('editForm');
    var saveEditButton = document.getElementById('saveEditButton');
    var recordId = null;
    var recordData = null;
    var addModal = document.getElementById('addModal');
    var addForm = document.getElementById('addForm');
    var saveAddButton = document.getElementById('saveAddButton');
    var entidad = window.entidad;

    // Mapeo para mostrar nombres personalizados de las entidades
    var entityDisplayNames = {
        cabanas: "Cabaña",
        reservas: "Reserva",
        clientes: "Cliente"
    };

    if (!confirmationModal || !editModal || !addModal) {
        console.error('Uno o más modales no se encontraron');
        return;
    }

    function setMinDateForDateFields(form) {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = form.querySelectorAll('input[type="date"]');
        dateInputs.forEach(function (input) {
            input.setAttribute('min', today);
        });
    }

    function validateDateRange(fechaInicio, fechaFin) {
        if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
            Swal.fire({
                icon: "warning",
                title: "¡Atención!",
                text: "La fecha de Check In no puede ser posterior a la fecha de Check Out.",
            });
            return false;
        }
        return true;
    }

    function exito(accion) {
        var displayName = entityDisplayNames[entidad] || entidad; // Usa el nombre personalizado si está disponible
        var actionText = '';

        // Determina el mensaje basado en la acción (editar o agregar)
        if (accion === 'edit') {
            actionText = 'editado';
        } else if (accion === 'add') {
            actionText = 'agregado';
        }

        Swal.fire({
            icon: 'success',
            title: `¡${displayName} ${actionText} exitosamente!`,
        }).then(() => {
            window.location.reload();
        });
    }

    editModal.addEventListener('show.bs.modal', function (event) {
        var button = event.relatedTarget;
        recordId = button.getAttribute('data-id');
        recordData = JSON.parse(button.getAttribute('data-info'));

        editForm.innerHTML = '';
        encabezados.forEach(function (encabezado, index) {
            var key = Object.keys(recordData)[index];
            if (key !== 'dias' && key !== 'costo_total' && key !== 'numero_reserva') {
                var formGroup = document.createElement('div');
                formGroup.className = 'mb-3';
                var label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = encabezado;
                label.setAttribute('for', key);
                formGroup.appendChild(label);
                var input = document.createElement('input');
                input.className = 'form-control';
                input.setAttribute('type', key.includes('fecha') ? 'date' : 'text');
                input.setAttribute('name', key);
                input.setAttribute('id', key);
                if (key.includes('fecha')) {
                    var formattedDate = recordData[key].split('/').reverse().join('-');
                    input.value = formattedDate;
                } else {
                    input.value = recordData[key];
                }
                formGroup.appendChild(input);
                editForm.appendChild(formGroup);
            }
        });

        setMinDateForDateFields(editForm);
    });

    addModal.addEventListener('show.bs.modal', function (event) {
        addForm.innerHTML = '';
        encabezados.forEach(function (encabezado) {
            var key = encabezado;
            if (!['Días de Reserva', 'Costo Total', 'N° Reserva'].includes(encabezado)) {
                var formGroup = document.createElement('div');
                formGroup.className = 'mb-3';
                var label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = encabezado;
                label.setAttribute('for', key);
                formGroup.appendChild(label);
                var input = document.createElement('input');
                input.className = 'form-control';
                input.setAttribute('type', key.includes('Check') ? 'date' : 'text');
                input.setAttribute('name', key);
                input.setAttribute('id', key);
                formGroup.appendChild(input);
                addForm.appendChild(formGroup);
            }
        });

        setMinDateForDateFields(addForm);
    });

    saveEditButton.addEventListener('click', function () {
        var fechaInicio = editForm.querySelector('[name="fecha_inicio"]')?.value;
        var fechaFin = editForm.querySelector('[name="fecha_fin"]')?.value;
        if (!validateDateRange(fechaInicio, fechaFin)) return;

        var formData = {};
        encabezados.forEach(function (encabezado, index) {
            var key = Object.keys(recordData)[index];
            if (key !== 'dias' && key !== 'costo_total') {
                var input = editForm.querySelector(`[name="${key}"]`);
                if (input) {
                    if (key.includes('Check')) {
                        let [year, month, day] = input.value.split('-');
                        formData[key] = `${year}-${month}-${day}`;
                    } else {
                        formData[key] = input.value;
                    }
                } else {
                    console.error('No se encontró el input para:', key);
                }
            }
        });

        fetch(`/${entidad}/${recordId}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then(response => {
            if (response.ok) {
                exito('edit'); // Llamada a la nueva función de éxito con 'edit'
            } else {
                alert('Hubo un error al guardar los cambios.');
            }
        }).catch(error => {
            alert('Hubo un error al procesar la solicitud.');
        });
    });

    saveAddButton.addEventListener('click', function () {
        var fechaInicio = addForm.querySelector('[name="Check In"]')?.value;
        var fechaFin = addForm.querySelector('[name="Check Out"]')?.value;
        if (!validateDateRange(fechaInicio, fechaFin)) return;

        var formData = {};
        encabezados.forEach(function (encabezado) {
            if (!['Días de Reserva', 'Costo Total'].includes(encabezado)) {
                var input = addForm.querySelector(`[name="${encabezado}"]`);
                if (input) {
                    var fieldName = fieldMapping[encabezado] || encabezado;
                    if (fieldName.includes('Check')) {
                        let [year, month, day] = input.value.split('-');
                        formData[fieldName] = `${year}-${month}-${day}`;
                    } else {
                        formData[fieldName] = input.value;
                    }
                } else {
                    console.error('No se encontró el input para:', encabezado);
                }
            }
        });

        fetch(`/${entidad}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then(response => {
            if (response.ok) {
                exito('add'); // Llamada a la nueva función de éxito con 'add'
            } else {
                alert('Hubo un error al guardar el nuevo registro.');
            }
        }).catch(error => {
            alert('Hubo un error al procesar la solicitud.');
        });
    });

    confirmationModal.addEventListener('show.bs.modal', function (event) {
        var button = event.relatedTarget;
        var id = button.getAttribute('data-id');
        confirmDeleteButton.setAttribute('data-id', id);
    });

    confirmDeleteButton.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        window.location.href = `/${entidad}/${id}/delete`;
    });
});
