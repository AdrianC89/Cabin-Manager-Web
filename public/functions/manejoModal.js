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
    var entidad = window.entidad; // Usa la variable `entidad` inyectada en el HTML

    if (!confirmationModal || !editModal || !addModal) {
        console.error('Uno o más modales no se encontraron');
        return;
    }

    editModal.addEventListener('show.bs.modal', function (event) {
        var button = event.relatedTarget;
        recordId = button.getAttribute('data-id');
        recordData = JSON.parse(button.getAttribute('data-info'));

        editForm.innerHTML = '';

        encabezados.forEach(function (encabezado, index) {
            var key = Object.keys(recordData)[index];
            // Excluye los campos calculados como 'dias' y 'costo_total'
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
    });

    addModal.addEventListener('show.bs.modal', function (event) {
        addForm.innerHTML = '';

        encabezados.forEach(function (encabezado) {
            var key = encabezado;
            // Excluye los campos calculados como 'dias' y 'costo_total'
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
    });

    saveEditButton.addEventListener('click', function () {
        var formData = {};
        encabezados.forEach(function (encabezado, index) {
            var key = Object.keys(recordData)[index];
            // Excluye los campos calculados como 'dias' y 'costo_total'
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
                window.location.reload();
            } else {
                alert('Hubo un error al guardar los cambios.');
            }
        }).catch(error => {
            alert('Hubo un error al procesar la solicitud.');
        });
    });

    saveAddButton.addEventListener('click', function () {
        var formData = {};
        encabezados.forEach(function (encabezado) {
            // Excluye los campos calculados como 'dias' y 'costo_total'
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
                window.location.reload();
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
