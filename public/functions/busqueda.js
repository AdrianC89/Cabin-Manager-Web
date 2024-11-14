  
   
   // Establecer la fecha mínima como la fecha actual
   const today = new Date().toISOString().split('T')[0];
   document.getElementById('fecha_inicio').setAttribute('min', today);
   document.getElementById('fecha_fin').setAttribute('min', today);

   // Función para buscar clientes mediante AJAX
   function buscarClientes() {
       const nombre = document.getElementById('nombre').value;

       fetch(`/buscar/clientes?nombre=${nombre}`)
           .then(response => response.json())
           .then(data => {
               const resultadosClientes = document.getElementById('resultadosClientes');
               resultadosClientes.innerHTML = '';

               if (data.clientes && data.clientes.length > 0) {
                   data.clientes.forEach(cliente => {
                       const clienteElement = document.createElement('p');
                       clienteElement.textContent = `${cliente.nombre}`;
                       resultadosClientes.appendChild(clienteElement);
                   });
               } else {
                   resultadosClientes.innerHTML = '<p>No se encontraron clientes con ese nombre.</p>';
               }
           })
           .catch(error => console.error('Error en la búsqueda de clientes:', error));
   }

   // Función para buscar cabañas libres mediante AJAX
   function buscarCabanas() {
       const fechaInicio = document.getElementById('fecha_inicio').value;
       const fechaFin = document.getElementById('fecha_fin').value;

       // Validar que la fecha de inicio sea anterior a la fecha de fin
       if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
        Swal.fire({
            icon: "warning",
            title: "¡Atención!",
            text: "La fecha de Check In no puede ser posterior a la fecha de Check Out.",
          });
           return;
       }

       // Si las fechas son válidas, realiza la búsqueda
       fetch(`/buscar/cabanas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
           .then(response => response.json())
           .then(data => {
               const resultadosCabanas = document.getElementById('resultadosCabanas');
               resultadosCabanas.innerHTML = '';

               if (data.cabanas && data.cabanas.length > 0) {
                   data.cabanas.forEach(cabana => {
                       const cabanaElement = document.createElement('p');
                       cabanaElement.textContent = `Cabaña Nº ${cabana.numero} - Capacidad: ${cabana.capacidad} personas`;
                       resultadosCabanas.appendChild(cabanaElement);
                   });
               } else {
                   resultadosCabanas.innerHTML = '<p>No hay cabañas disponibles para el rango de fechas seleccionado.</p>';
               }
           })
           .catch(error => console.error('Error en la búsqueda de cabañas:', error));
   }