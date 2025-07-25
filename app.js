const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas-preview');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('history-grid');
const toast = document.getElementById('status-toast');
let cameraStream = null;

function videoListo(video) {
    return video && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0;
}

async function iniciarCamara() {
    try {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            camera.srcObject = null;
        }
        const constraints = {
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        };
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        camera.srcObject = cameraStream;
        await camera.play();
        console.log('Camera started');
    } catch (err) {
        console.error('Camera error:', err);
        mostrarEstado('error', 'No se pudo acceder a la cámara: ' + err.message);
    }
}

async function generarCaptura() {
    try {
        // Mostrar indicador de procesamiento
        mostrarEstado('processing', 'Procesando...');

        if (!videoListo(camera)) {
            throw new Error('Cámara no lista');
        }
        canvas.width = camera.videoWidth || 640;
        canvas.height = camera.videoHeight || 480;
        ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
        const imagen = canvas.toDataURL('image/jpeg', 0.9);
        const ahora = new Date();
        const captura = {
            timestamp: ahora.getTime(),
            coords: await getCoordenadas(),
            src: imagen,
            horaOficial: ahora.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'America/Santiago'
            }),
            fechaCompleta: ahora.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        try {
            if (typeof Tesseract !== 'undefined') {
                const ocrResult = await extraerFechaConOCR(canvas);
                captura.ocrResult = ocrResult;
            } else {
                captura.ocrError = 'Tesseract.js no está disponible';
                mostrarEstado('error', 'No se pudo cargar Tesseract.js para OCR');
            }
        } catch (ocrError) {
            captura.ocrError = 'No se pudo procesar el texto: ' + ocrError.message;
            mostrarEstado('error', 'No se detectó texto válido en el recuadro. Verifica la iluminación, enfoque o tamaño del texto.');
        }
        await guardarCaptura(captura);
        cargarHistorial();
        mostrarEstado('success', '✅ Captura registrada');
    } catch (error) {
        console.error('Capture error:', error);
        mostrarEstado('error', 'Error al capturar: ' + error.message);
    }
}

async function getCoordenadas() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({
                lat: pos.coords.latitude.toFixed(6),
                lon: pos.coords.longitude.toFixed(6)
            }),
            () => resolve({ lat: "?", lon: "?" })
        );
    });
}

async function extraerFechaConOCR(imagenElement) {
    try {
        // Crear un canvas temporal para recortar el área del recuadro verde
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Obtener dimensiones del recuadro verde (#selection-rectangle)
        const rectangle = document.getElementById('selection-rectangle');
        const rectStyles = getComputedStyle(rectangle);
        const rectWidthPercent = parseFloat(rectStyles.width) / 100; // 80% del contenedor
        const rectAspectRatio = 16 / 9; // Definido en CSS
        const videoWidth = imagenElement.width;
        const videoHeight = imagenElement.height;

        // Calcular dimensiones y posición del recuadro en píxeles
        const rectWidth = videoWidth * rectWidthPercent;
        const rectHeight = rectWidth / rectAspectRatio;
        const rectX = (videoWidth - rectWidth) / 2; // Centrado horizontalmente
        const rectY = (videoHeight - rectHeight) / 2; // Centrado verticalmente

        // Configurar el canvas temporal con las dimensiones del recuadro
        tempCanvas.width = rectWidth;
        tempCanvas.height = rectHeight;

        // Recortar la imagen al área del recuadro
        tempCtx.drawImage(
            imagenElement,
            rectX, rectY, rectWidth, rectHeight, // Área fuente (recuadro)
            0, 0, rectWidth, rectHeight // Área destino (canvas temporal)
        );

        // Preprocesamiento: Aplicar escala de grises y aumentar contraste
        tempCtx.filter = 'grayscale(100%) contrast(150%)';
        tempCtx.drawImage(tempCanvas, 0, 0);

        // Aumentar la resolución del canvas temporal para mejorar la detección
        const scaleFactor = 2; // Duplicar la resolución
        const scaledCanvas = document.createElement('canvas');
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCanvas.width = rectWidth * scaleFactor;
        scaledCanvas.height = rectHeight * scaleFactor;
        scaledCtx.imageSmoothingEnabled = true;
        scaledCtx.drawImage(tempCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

        // Configurar Tesseract.js con parámetros optimizados
        const { data: { text, confidence } } = await Tesseract.recognize(scaledCanvas, 'spa+eng', {
            tessedit_pageseg_mode: '6', // Asume un bloque de texto uniforme
            tessedit_char_whitelist: '0123456789-:abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            tessedit_ocr_engine_mode: '1' // Usa modo LSTM solo (más preciso para texto claro)
        });
        console.log('OCR text:', text);

        // Expresión regular para detectar múltiples formatos de fecha y hora
        const fechaHora = text.match(
            /(?:(\d{1,2})[-\/](?:\d{1,2}|(?:jan|ene|feb|mar|apr|abr|may|jun|jul|ago|aug|sep|oct|nov|dic|dec)[a-z]*)[-\/](\d{4}))(?:\s+(?:lun|mar|mié|jue|vie|sáb|dom|mon|tue|wed|thu|fri|sat|sun))?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i
        );
        if (fechaHora) {
            const [_, dia, anio, hora, minuto, segundo] = fechaHora;
            const mesMatch = text.match(/(jan|ene|feb|mar|apr|abr|may|jun|jul|ago|aug|sep|oct|nov|dic|dec)/i)?.[0] || text.match(/\d{1,2}/)?.[0];
            return {
                fechaHora: `${dia}-${mesMatch}-${anio} ${hora}:${minuto}${segundo ? `:${segundo}` : ''}`,
                confianza: confidence
            };
        }
        return { fechaHora: null, confianza: 0 };
    } catch (error) {
        throw new Error('Error en OCR: ' + error.message);
    }
}

function mostrarEstado(tipo, mensaje) {
    toast.className = `toast-${tipo}`;
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    if (tipo === 'processing') {
        toast.style.animation = 'spin 1s linear infinite';
    } else {
        toast.style.animation = 'none';
    }
    setTimeout(() => {
        if (tipo !== 'processing') {
            toast.style.opacity = '0';
        }
    }, tipo === 'processing' ? 0 : 2500);
}

function cargarHistorial() {
    cargarCapturas(capturas => {
        gallery.innerHTML = capturas.length ? '' : '<p class="no-data">No hay capturas guardadas</p>';
        capturas.reverse().forEach(captura => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.timestamp = captura.timestamp;
            const img = document.createElement('img');
            img.src = captura.src;
            img.className = 'gallery-image';
            img.alt = `Captura del ${new Date(captura.timestamp).toLocaleString('es-CL')}`;
            img.onclick = () => mostrarImagenEnVisor(captura);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.onclick = () => eliminarCapturaDB(captura.timestamp, () => cargarHistorial());
            item.append(img, deleteBtn);
            gallery.appendChild(item);
        });
    });
}

function mostrarImagenEnVisor(captura) {
    const visor = document.getElementById('visor-modal');
    const img = document.getElementById('visor-img');
    const info = document.getElementById('visor-info');
    const mapsBtn = document.getElementById('maps-btn');
    img.src = captura.src;
    info.innerHTML = `
        <p><strong>Fecha y hora:</strong> ${captura.fechaCompleta}</p>
        <p><strong>Hora oficial:</strong> ${captura.horaOficial}</p>
        <p><strong>Ubicación:</strong> ${captura.coords.lat}, ${captura.coords.lon}</p>
        ${captura.ocrResult ? `<p><strong>OCR:</strong> ${captura.ocrResult.fechaHora} (${captura.ocrResult.confianza}%)</p>` : ''}
        ${captura.ocrError ? `<p><strong>Error OCR:</strong> ${captura.ocrError}</p>` : ''}
    `;
    mapsBtn.style.display = captura.coords.lat !== '?' ? 'inline-block' : 'none';
    mapsBtn.onclick = () => window.open(`https://www.google.com/maps?q=${captura.coords.lat},${captura.coords.lon}`, '_blank');
    document.getElementById('descargar-img').onclick = () => {
        const link = document.createElement('a');
        link.href = captura.src;
        link.download = `captura-${captura.timestamp}.jpg`;
        link.click();
    };
    visor.style.display = 'flex';
    document.getElementById('cerrar-visor').onclick = () => {
        visor.style.display = 'none';
    };
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarCamara();
    cargarHistorial();
    document.getElementById('capture-btn').addEventListener('click', generarCaptura);
    document.getElementById('capture-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        generarCaptura();
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const id = tab.getAttribute('aria-controls');
            mostrarSeccion(id);
        });
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker error:', err));
    }
});

async function mostrarSeccion(id) {
    const vistas = document.querySelectorAll('.vista');
    const tabs = document.querySelectorAll('.tab');
    vistas.forEach(vista => {
        vista.classList.toggle('visible', vista.id === id);
        vista.setAttribute('aria-hidden', vista.id !== id);
    });
    tabs.forEach(tab => {
        const isActive = tab.getAttribute('aria-controls') === id;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });
    document.getElementById('tab-indicator').style.transform = `translateX(${id === 'captura' ? 0 : 100}%)`;
    if (id === 'captura') {
        await iniciarCamara();
    } else {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            camera.srcObject = null;
        }
        cargarHistorial();
    }
}