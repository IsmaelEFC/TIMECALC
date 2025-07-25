// Inicialización de Datepickers
$(document).ready(function () {
  // Establecer la localización en español explícitamente
  $.datepicker.setDefaults($.datepicker.regional['es']);

  const datepickerOptions = {
    dateFormat: 'dd/mm/yy',
    autoclose: true,
    todayHighlight: true,
    templates: { leftArrow: '<i class="bi bi-chevron-left"></i>', rightArrow: '<i class="bi bi-chevron-right"></i>' }
  };

  // Aplicar datepicker a los campos
  $('#fechaDVR, #fechaOficial, #nuevaFecha, #nuevaFecha2').datepicker(datepickerOptions);

  // Validación y formateo de campos de hora
  $('.timepicker').on('input', function () {
    let value = $(this).val().replace(/\D/g, '');
    if (value.length >= 4) value = `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
    $(this).val(value);
    $(this).toggleClass('invalid', !validateTime(value));
  }).on('blur', function () {
    let value = $(this).val();
    if (validateTime(value)) {
      $(this).val(formatTime(value));
      autocompleteDate($(this).attr('id'));
    } else {
      $(this).val('');
    }
    calcularDiferencia();
  });
});

// Función para validar formato de hora (HH:mm:ss)
function validateTime(value) {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
}

// Función para formatear hora
function formatTime(value) {
  const parts = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})(\d{0,2})/);
  return `${parts[1] || '00'}:${parts[2] || '00'}:${parts[3] || '00'}`;
}

// Autocompletar fecha si está vacía
function autocompleteDate(timepickerId) {
  const dateFields = {
    'horaDVR': 'fechaDVR',
    'horaOficial': 'fechaOficial',
    'nuevaHoraOficial': 'nuevaFecha',
    'nuevaHoraOficial2': 'nuevaFecha2'
  };
  const dateField = document.getElementById(dateFields[timepickerId]);
  if (dateField && !dateField.value) dateField.value = moment().format('DD/MM/YYYY');
}

// Sección 1: Calcular Diferencia entre DVR y Oficial
function calcularDiferencia() {
  const fechaDvr = $('#fechaDVR').val();
  const horaDvr = $('#horaDVR').val();
  const fechaOficial = $('#fechaOficial').val();
  const horaOficial = $('#horaOficial').val();

  // Usar UTC para evitar ajustes de horario de verano
  const fechaHoraDvr = moment.utc(`${fechaDvr} ${horaDvr}`, 'DD/MM/YYYY HH:mm:ss');
  const fechaHoraOficial = moment.utc(`${fechaOficial} ${horaOficial}`, 'DD/MM/YYYY HH:mm:ss');
  const diferencia = moment.duration(fechaHoraDvr.diff(fechaHoraOficial));

  const anos = Math.abs(diferencia.years());
  const meses = Math.abs(diferencia.months());
  const dias = Math.abs(diferencia.days());
  const horas = Math.abs(diferencia.hours());
  const minutos = Math.abs(diferencia.minutes());
  const segundos = Math.abs(diferencia.seconds());

  const componentes = [];
  if (anos > 0) componentes.push(`${anos} año${anos > 1 ? 's' : ''}`);
  if (meses > 0) componentes.push(`${meses} mes${meses > 1 ? 'es' : ''}`);
  if (dias > 0) componentes.push(`${dias} día${dias > 1 ? 's' : ''}`);
  if (horas > 0) componentes.push(`${horas} hora${horas > 1 ? 's' : ''}`);
  if (minutos > 0) componentes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`);
  if (segundos > 0) componentes.push(`${segundos} segundo${segundos > 1 ? 's' : ''}`);

  let resultadoTexto = '';
  if (componentes.length > 0) {
    resultadoTexto = componentes.length > 1
      ? `${componentes.slice(0, -1).join(', ')} y ${componentes.slice(-1)}`
      : componentes[0];
    resultadoTexto = `El desfase de horario es: <span class='difference'>${resultadoTexto}</span>`;
  } else {
    resultadoTexto = 'Sin desfase de horario';
  }

  const mensaje = diferencia.asSeconds() > 0 ? "<span class='adelanto'>Adelanto</span> con respecto a la hora oficial." :
                  diferencia.asSeconds() < 0 ? "<span class='retraso'>Retraso</span> con respecto a la hora oficial." :
                  "Sin desfase de horario";

  $('#resultado').html(resultadoTexto);
  $('#mensaje').html(mensaje);
}

// Sección 2: Mostrar/Ocultar y Calcular Hora DVR
function mostrarIngresoHoraOficial() {
  $('#ingresoHoraOficial').toggle();
}

function calcularNuevaHoraDvr() {
  const fechaDvr = $('#fechaDVR').val();
  const horaDvr = $('#horaDVR').val();
  const fechaOficial = $('#fechaOficial').val();
  const horaOficial = $('#horaOficial').val();
  const nuevaFecha = $('#nuevaFecha').val();
  const nuevaHoraOficial = $('#nuevaHoraOficial').val();

  const fechaHoraDvr = moment(`${fechaDvr} ${horaDvr}`, 'DD/MM/YYYY HH:mm:ss');
  const fechaHoraOficial = moment(`${fechaOficial} ${horaOficial}`, 'DD/MM/YYYY HH:mm:ss');
  const nuevaFechaHoraOficial = moment(`${nuevaFecha} ${nuevaHoraOficial}`, 'DD/MM/YYYY HH:mm:ss');
  const diferenciaSegundos = Math.abs(fechaHoraDvr.diff(fechaHoraOficial, 'seconds'));

  const nuevaFechaHoraDvr = fechaHoraDvr.isBefore(fechaHoraOficial) ?
    nuevaFechaHoraOficial.clone().subtract(diferenciaSegundos, 'seconds') :
    nuevaFechaHoraOficial.clone().add(diferenciaSegundos, 'seconds');

  $('#nuevoResultado').html(`La hora para buscar en DVR es: <span class='difference'>${nuevaFechaHoraDvr.format('DD/MM/YYYY HH:mm:ss')}</span>`);
}

// Sección 3: Mostrar/Ocultar y Calcular Hora Oficial
function mostrarIngresoHoraOficial2() {
  $('#ingresoHoraOficial2').toggle();
}

function calcularNuevaHora2() {
  const fechaDvr = $('#fechaDVR').val();
  const horaDvr = $('#horaDVR').val();
  const fechaOficial = $('#fechaOficial').val();
  const horaOficial = $('#horaOficial').val();
  const nuevaFecha2 = $('#nuevaFecha2').val();
  const nuevaHoraOficial2 = $('#nuevaHoraOficial2').val();

  const fechaHoraDvr = moment(`${fechaDvr} ${horaDvr}`, 'DD/MM/YYYY HH:mm:ss');
  const fechaHoraOficial = moment(`${fechaOficial} ${horaOficial}`, 'DD/MM/YYYY HH:mm:ss');
  const nuevaFechaHoraDvr = moment(`${nuevaFecha2} ${nuevaHoraOficial2}`, 'DD/MM/YYYY HH:mm:ss');
  const diferenciaSegundos = Math.abs(fechaHoraDvr.diff(fechaHoraOficial, 'seconds'));

  const nuevaFechaHoraOficial = fechaHoraDvr.isBefore(fechaHoraOficial) ?
    nuevaFechaHoraDvr.clone().add(diferenciaSegundos, 'seconds') :
    nuevaFechaHoraDvr.clone().subtract(diferenciaSegundos, 'seconds');

  $('#nuevoResultado2').html(`La hora Oficial es: <span class='difference'>${nuevaFechaHoraOficial.format('DD/MM/YYYY HH:mm:ss')}</span>`);
}

// Deshabilitar clic derecho
document.addEventListener('contextmenu', e => e.preventDefault());
