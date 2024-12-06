document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const actionMenu = document.getElementById('actionMenu');
    const localidadSelect = document.getElementById('localidadSelect');
    const direccionSelect = document.getElementById('direccionSelect');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const sidebar = document.getElementById('sidebar');
    const selectAllCheckbox = document.getElementById('selectAllBtn');
    const filtrarBtn = document.getElementById('filtrarBtn');

    window.onload = function () {
        loadStoredData();
    };

    // Cargar los datos de CURPs desde localStorage
    function loadStoredData() {
        const storedCurps = localStorage.getItem("curps");
        tableBody.innerHTML = ""; // Limpiar la tabla

        if (storedCurps) {
            const curps = JSON.parse(storedCurps).map(curp => ({
                ...curp,
                localidad: curp.localidad || 'Ninguno',
                direccionAtencion: curp.direccionAtencion || 'Ninguno'
            }));
            curps.sort((a, b) => a.clave.localeCompare(b.clave)); // Ordenar CURPs por clave
            curps.forEach((curpData, index) => displayData(curpData, index + 1));
        }
    }

    // Mostrar una CURP en la tabla
    function displayData(curpData, index) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index}</td>
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
    }

    // Filtrar las CURPs según la selección de filtros y el término de búsqueda
    function applyFilters() {
        const filter = searchInput.value.toLowerCase(); // Término de búsqueda ingresado
        const localidad = localidadSelect.value.toLowerCase(); // Filtro de localidad
        const direccion = direccionSelect.value.toLowerCase(); // Filtro de dirección de atención
        const storedCurps = JSON.parse(localStorage.getItem("curps")) || []; // Datos almacenados

        // Filtrar datos según localidad, dirección y término de búsqueda
        const filteredCurps = storedCurps.filter(curpData => {
            const matchLocalidad = localidad === "" || curpData.localidad.toLowerCase() === localidad;
            const matchDireccion = direccion === "" || curpData.direccionAtencion.toLowerCase() === direccion;

            const matchBusqueda =
                curpData.nombres.toLowerCase().includes(filter) ||
                curpData.apellidoP.toLowerCase().includes(filter) ||
                curpData.apellidoM.toLowerCase().includes(filter) ||
                curpData.curp.toLowerCase().includes(filter); // También incluye el CURP en la búsqueda

            return matchLocalidad && matchDireccion && matchBusqueda; // Coinciden todos los criterios
        });

        // Mostrar los datos filtrados en la tabla
        tableBody.innerHTML = ''; // Limpiar tabla
        filteredCurps.forEach((curpData, index) => displayData(curpData, index + 1));
    }

    // Eliminar las CURPs seleccionadas
    function deleteSelectedRows() {
        const selectedCheckboxes = document.querySelectorAll(".select-row:checked");
        let curps = JSON.parse(localStorage.getItem("curps")) || [];

        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.parentElement.parentElement;
            const curp = row.children[3].textContent; // El CURP está en la columna 3
            curps = curps.filter(curpData => curpData.curp !== curp);
            row.remove();
        });

        localStorage.setItem("curps", JSON.stringify(curps));
    }

    // Seleccionar o desmarcar todas las CURPs
    function selectAllCurps() {
        const checkboxes = document.querySelectorAll(".select-row");
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked; // Sincronizar con el checkbox de "Seleccionar todas"
        });
        toggleActionMenu();
    }

    // Mostrar u ocultar el menú de acciones según las selecciones
    function toggleActionMenu() {
        const selectedCheckboxes = document.querySelectorAll(".select-row:checked");
        if (selectedCheckboxes.length > 0) {
            actionMenu.style.display = "flex"; // Mostrar menú de acciones si hay selecciones
        } else {
            actionMenu.style.display = "none"; // Ocultar menú si no hay selecciones
        }
    }

    // Menu de navegación
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // Escuchar eventos
    searchInput.addEventListener('input', applyFilters); // Buscar mientras escribes
    localidadSelect.addEventListener('change', applyFilters); // Filtrar por localidad
    direccionSelect.addEventListener('change', applyFilters); // Filtrar por dirección
    filtrarBtn.addEventListener('click', applyFilters); // Botón de filtrar

    selectAllCheckbox.addEventListener("click", selectAllCurps);
    tableBody.addEventListener("change", function (event) {
        if (event.target.classList.contains("select-row")) {
            toggleActionMenu(); // Actualizar la visibilidad del menú
        }
    });

    document.getElementById("closeActionMenu").addEventListener('click', () => actionMenu.style.display = 'none');
    document.getElementById("deleteButton").addEventListener("click", deleteSelectedRows);

    // Cargar datos y filtros al cargar la página
    loadStoredData();
});
