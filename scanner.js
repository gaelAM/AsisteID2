// Seleccionar elementos del DOM
const video = document.getElementById("camera");
const cameraContainer = document.getElementById("cameraContainer");
const scannedDataContainer = document.getElementById("scannedDataContainer");
const scannedDataTable = document.getElementById("scannedDataTable");
const saveCurpButton = document.getElementById("saveCurpButton");
const discardCurpButton = document.getElementById("discardCurpButton");
const qrInput = document.getElementById("qrInput");

// Variable para almacenar datos escaneados temporalmente
let currentCurpData = null;

// Verificar que todos los elementos existen
if (!video || !cameraContainer || !scannedDataContainer || !scannedDataTable || !saveCurpButton || !discardCurpButton || !qrInput) {
    alert("Error: Algunos elementos no se encontraron en el DOM.");
    console.error("Error: Verifica que todos los elementos necesarios están en el HTML.");
}

// Asignar eventos a los botones
saveCurpButton.addEventListener("click", function () {
    if (currentCurpData) {
        saveCurp(currentCurpData);
    } else {
        alert("No hay datos para guardar.");
    }
});

discardCurpButton.addEventListener("click", function () {
    scannedDataContainer.style.display = "none"; // Ocultar los datos
    currentCurpData = null; // Limpiar los datos temporales
});
// Manejar el evento de selección de archivo
qrInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Por favor, selecciona un archivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

            if (qrCode) {
                console.log("QR Code detectado desde archivo:", qrCode.data);
                parseCURPData(qrCode.data); // Procesar los datos del QR
            } else {
                alert("No se detectó un código QR válido en el archivo.");
                console.error("Error: No se detectó un código QR en el archivo.");
            }
        };
        img.onerror = function () {
            alert("Error al cargar la imagen. Por favor, intenta con otro archivo.");
            console.error("Error: No se pudo cargar la imagen.");
        };
    };
    reader.onerror = function () {
        alert("Error al leer el archivo. Por favor, intenta con otro archivo.");
        console.error("Error: No se pudo leer el archivo.");
    };
    reader.readAsDataURL(file);
});

// Iniciar la cámara
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            video.srcObject = stream;
            cameraContainer.style.display = "block"; // Mostrar la cámara
            video.setAttribute("playsinline", true);
            video.play();
            requestAnimationFrame(scanQRCode);
        })
        .catch((err) => {
            alert("No se pudo acceder a la cámara: " + err.message);
            console.error("Error al acceder a la cámara:", err);
        });
}

// Escanear QR usando la cámara
function scanQRCode() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
            parseCURPData(qrCode.data);
            stopCamera();
            return;
        }
    }
    requestAnimationFrame(scanQRCode);
}

// Detener la cámara
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    cameraContainer.style.display = "none"; // Ocultar la cámara
    video.srcObject = null;
}

// Procesar datos del QR
function parseCURPData(data) {
    const fields = data.split('|');

    if (fields.length < 9) {
        alert("Formato de CURP no válido.");
        console.error("Formato de CURP incorrecto:", data);
        return;
    }

    const [clave, curp, apellidoP, apellidoM, nombres, sexo, fechaNacimiento, entidad, homoclave] = fields;
    const curpData = {
        clave, curp, apellidoP, apellidoM, nombres, sexo, fechaNacimiento, entidad, homoclave
    };

    displayScannedData(curpData);
}

// Mostrar datos escaneados
function displayScannedData(curpData) {
    const localidad = document.getElementById("localidad").value;
    const direccionAtencion = document.getElementById("direccionAtencion").value;

    // Guardar datos temporalmente
    currentCurpData = {
        ...curpData,
        localidad,
        direccionAtencion,
    };

    scannedDataTable.innerHTML = `
        <tr>
            <td>${curpData.clave}</td>
            <td>${curpData.curp}</td>
            <td>${curpData.apellidoP}</td>
            <td>${curpData.apellidoM}</td>
            <td>${curpData.nombres}</td>
            <td>${curpData.sexo}</td>
            <td>${curpData.fechaNacimiento}</td>
            <td>${curpData.entidad}</td>
            <td>${curpData.homoclave}</td>
            <td>${localidad}</td>
            <td>${direccionAtencion}</td>
        </tr>
    `;

    scannedDataContainer.style.display = "block";
}

// Guardar CURP en localStorage
function saveCurp(curpData) {
    let curps = JSON.parse(localStorage.getItem("curps")) || [];

    // Verificar si la CURP ya está registrada
    const curpExists = curps.some(
        (curp) =>
            curp.apellidoP === curpData.apellidoP &&
            curp.apellidoM === curpData.apellidoM &&
            curp.nombres === curpData.nombres
    );

    // Contenedor para mensajes
    const messageContainer = document.createElement("div");
    messageContainer.style.cssText = `
        margin-top: 10px;
        font-size: 16px;
        border: 1px solid;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
        max-width: 400px;
        margin: 0 auto;
    `;

    if (curpExists) {
        // Mostrar mensaje de duplicado
        messageContainer.textContent = "Esta CURP ya está registrada.";
        messageContainer.style.color = "red";
        messageContainer.style.borderColor = "red";
        messageContainer.style.backgroundColor = "#ffe6e6";
        scannedDataContainer.parentElement.appendChild(messageContainer);

        // Eliminar el mensaje automáticamente después de 5 segundos
        setTimeout(() => {
            messageContainer.remove();
        }, 5000);

        return;
    }

    // Guardar CURP
    curps.push(curpData);
    localStorage.setItem("curps", JSON.stringify(curps));

    // Mostrar mensaje de confirmación
    messageContainer.textContent = "Datos de la CURP guardados. Puedes verlos en Consulta de CURPs";
    messageContainer.style.color = "green";
    messageContainer.style.borderColor = "green";
    messageContainer.style.backgroundColor = "#e6ffe6";
    scannedDataContainer.parentElement.appendChild(messageContainer);

    // Eliminar el mensaje automáticamente después de 5 segundos
    setTimeout(() => {
        messageContainer.remove();
    }, 5000);

    scannedDataContainer.style.display = "none";
    currentCurpData = null;
}
