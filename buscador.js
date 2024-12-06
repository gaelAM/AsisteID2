document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const actionMenu = document.getElementById('actionMenu');
    const localidadSelect = document.getElementById('localidadSelect');
    const direccionSelect = document.getElementById('direccionSelect');

    function loadStoredData() {
        const storedCurps = localStorage.getItem('curps');
        tableBody.innerHTML = ''; // Limpiar la tabla

        if (storedCurps) {
            const curps = JSON.parse(storedCurps);
            curps.forEach(curpData => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="select-row"></td>
                    <td>${curpData.clave}</td>
                    <td>${curpData.curp}</td>
                    <td>${curpData.apellidoP}</td>
                    <td>${curpData.apellidoM}</td>
                    <td>${curpData.nombres}</td>
                    <td>${curpData.sexo}</td>
                    <td>${curpData.fechaNacimiento}</td>
                    <td>${curpData.entidad}</td>
                    <td>${curpData.homoclave}</td>
                    <td>${curpData.localidad}</td>
                    <td>${curpData.direccionAtencion}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    function filterTable() {
        const filter = searchInput.value.toLowerCase();
        const localidad = localidadSelect.value;
        const direccion = direccionSelect.value;
        const rows = tableBody.getElementsByTagName('tr');

        for (let row of rows) {
            const index = row.cells[0].textContent.toLowerCase(); // Índice
            const nombres = row.cells[6].textContent.toLowerCase(); // Nombres
            const apellidoP = row.cells[4].textContent.toLowerCase(); // Apellido paterno
            const apellidoM = row.cells[5].textContent.toLowerCase(); // Apellido materno
            const localidadValue = row.cells[10].textContent.toLowerCase();
            const direccionValue = row.cells[11].textContent.toLowerCase();

            const match =
                index.includes(filter) ||
                nombres.includes(filter) ||
                apellidoP.includes(filter) ||
                apellidoM.includes(filter) ||
                localidadValue.includes(filter) ||
                direccionValue.includes(filter);

            const matchLocalidad = localidad && localidad !== "Ninguno" ? localidadValue === localidad.toLowerCase() : true;
            const matchDireccion = direccion && direccion !== "Ninguno" ? direccionValue === direccion.toLowerCase() : true;

            // Muestra u oculta la fila según el resultado
            if (match && matchLocalidad && matchDireccion) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }

    searchInput.addEventListener('input', filterTable);
    localidadSelect.addEventListener('change', filterTable);
    direccionSelect.addEventListener('change', filterTable);

    loadStoredData();
});
