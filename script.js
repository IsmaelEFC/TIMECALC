//function cerrarSesion() {
  // Cierra la sesión del usuario
//  sessionStorage.clear();
//  window.location.href = "index.html"; // Redirige a la página de inicio
//}

$(document).ready(function () {
  $('#fechaDVR').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    startView: 'months',
    minViewMode: 'days',
    todayHighlight: true,
    language: 'es',
    templates: {
      leftArrow: '<i class="bi bi-chevron-left"></i>',
      rightArrow: '<i class="bi bi-chevron-right"></i>'
    }
  });

  $('#fechaOficial').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    startView: 'months',
    minViewMode: 'days',
    todayHighlight: true,
    language: 'es',
    templates: {
      leftArrow: '<i class="bi bi-chevron-left"></i>',
      rightArrow: '<i class="bi bi-chevron-right"></i>'
    }
  });

  $('#nuevaFecha').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    startView: 'months',
    minViewMode: 'days',
    todayHighlight: true,
    language: 'es',
    templates: {
      leftArrow: '<i class="bi bi-chevron-left"></i>',
      rightArrow: '<i class="bi bi-chevron-right"></i>'
    }
  });

  //ingreso nuevo
  $('#nuevaFecha2').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    startView: 'months',
    minViewMode: 'days',
    todayHighlight: true,
    language: 'es',
    templates: {
      leftArrow: '<i class="bi bi-chevron-left"></i>',
      rightArrow: '<i class="bi bi-chevron-right"></i>'
    }
  });

  $('.timepicker').on('input', function () {
    var value = $(this).val();
    var formattedValue = formatTime(value);
    $(this).val(formattedValue);
    if (validateTime(formattedValue)) {
      $(this).removeClass('invalid');
    } else {
      $(this).addClass('invalid');
    }
  });

  $('.timepicker').on('blur', function () {
    var value = $(this).val();
    if (validateTime(value)) {
      var formattedValue = formatTime(value);
      $(this).val(formattedValue);
      
      // Autocompletar la fecha si está vacía
      autocompleteDate($(this).attr('id'));
    } else {
      $(this).val('');
    }

    calcularDiferencia();
  });

  function validateTime(value) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
  }

  function formatTime(value) {
    value = value.replace(/\D/g, '');
    if (value.length >= 4) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4) + ':' + value.slice(4);
    } else if (value.length >= 2) {
      value = value.slice(0, 2) + ':' + value.slice(2);
    }
    return value;
  }

  function autocompleteDate(timepickerId) {
    let dateFieldId;
    switch (timepickerId) {
      case 'horaDVR':
        dateFieldId = 'fechaDVR';
        break;
      case 'horaOficial':
        dateFieldId = 'fechaOficial';
        break;
      case 'nuevaHoraOficial':
        dateFieldId = 'nuevaFecha';
        break;
      case 'nuevaHoraOficial2':
        dateFieldId = 'nuevaFecha2';
        break;
    }

    var dateField = document.getElementById(dateFieldId);
    if (dateField.value === '') {
      var today = moment().format('DD/MM/YYYY');
      dateField.value = today;
    }
  }
});

function calcularDiferencia() {
  var fechaDvr = document.getElementById("fechaDVR").value;
  var horaDvr = document.getElementById("horaDVR").value;
  var fechaOficial = document.getElementById("fechaOficial").value;
  var horaOficial = document.getElementById("horaOficial").value;

  // Obtener las fechas y horas en formato válido para cálculos
  var fechaHoraDvr = moment(`${fechaDvr} ${horaDvr}`, "DD/MM/YYYY HH:mm:ss");
  var fechaHoraOficial = moment(`${fechaOficial} ${horaOficial}`, "DD/MM/YYYY HH:mm:ss");

  // Calcular la diferencia de horas
  var diferenciaTotal = moment.duration(fechaHoraDvr.diff(fechaHoraOficial));

  // Calcular los componentes de la diferencia
  var anos = Math.abs(diferenciaTotal.years());
  var months = Math.abs(diferenciaTotal.months());
  var dias = Math.abs(diferenciaTotal.days());
  var horas = Math.abs(diferenciaTotal.hours());
  var minutos = Math.abs(diferenciaTotal.minutes());
  var segundos = Math.abs(diferenciaTotal.seconds());

  // Mostrar el resultado
  var resultado1 =
    "El desfase de horario es: <span class='difference'>" +
    anos +
    " años, " +
    months +
    " meses, " +
    dias +
    " días, " +
    horas +
    " horas, " +
    minutos +
    " minutos y " +
    segundos +
    " segundos.</span>";

  var mensaje = "";

  if (diferenciaTotal.asSeconds() > 0) {
    mensaje = "<span class='adelanto'>Adelanto</span> con respecto a la hora oficial.";
  } else if (diferenciaTotal.asSeconds() < 0) {
    mensaje = "<span class='retraso'>Retraso</span> con respecto a la hora oficial.";
  } else {
    mensaje = "Sin desfase de horario";
  }

  document.getElementById("resultado").innerHTML = resultado1;
  document.getElementById("mensaje").innerHTML = mensaje;
}



function mostrarIngresoHoraOficial() {
  var x = document.getElementById("ingresoHoraOficial");
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
}

function calcularNuevaHoraDvr() {
  var fechaDvr = document.getElementById("fechaDVR").value;
  var horaDvr = document.getElementById("horaDVR").value;
  var fechaOficial = document.getElementById("fechaOficial").value;
  var horaOficial = document.getElementById("horaOficial").value;
  var nuevaFecha = document.getElementById("nuevaFecha").value;
  var nuevaHoraOficial = document.getElementById("nuevaHoraOficial").value;

  var fechaHoraDvr = moment(`${fechaDvr} ${horaDvr}`, "DD/MM/YYYY HH:mm:ss");
  var fechaHoraOficial = moment(`${fechaOficial} ${horaOficial}`, "DD/MM/YYYY HH:mm:ss");
  var nuevaFechaHoraOficial = moment(`${nuevaFecha} ${nuevaHoraOficial}`, "DD/MM/YYYY HH:mm:ss");

  var diferenciaTotal = moment.duration(fechaHoraDvr.diff(fechaHoraOficial));
  var diferenciaTotalSegundos = Math.abs(diferenciaTotal.asSeconds());

  var nuevaFechaHoraDvr;
  if (diferenciaTotal.asSeconds() < 0) {
    nuevaFechaHoraDvr = nuevaFechaHoraOficial.clone().subtract(diferenciaTotalSegundos, 'seconds');
  } else {
    nuevaFechaHoraDvr = nuevaFechaHoraOficial.clone().add(diferenciaTotalSegundos, 'seconds');
  }

  var resultado2 =
    "La hora para buscar en DVR es: <span class='difference'>" +
    nuevaFechaHoraDvr.format("DD/MM/YYYY HH:mm:ss") +
    "</span>";

  document.getElementById("nuevoResultado").innerHTML = resultado2;
}


//clon bloque anterior

function mostrarIngresoHoraOficial2() {
  var x = document.getElementById("ingresoHoraOficial2");
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
}

function calcularNuevaHora2() {
  var fechaDvr = document.getElementById("fechaDVR").value;
  var horaDvr = document.getElementById("horaDVR").value;
  var fechaOficial = document.getElementById("fechaOficial").value;
  var horaOficial = document.getElementById("horaOficial").value;
  var nuevaFecha = document.getElementById("nuevaFecha2").value;
  var nuevaHoraOficial = document.getElementById("nuevaHoraOficial2").value;

  var fechaHoraDvr = moment(`${fechaDvr} ${horaDvr}`, "DD/MM/YYYY HH:mm:ss");
  var fechaHoraOficial = moment(`${fechaOficial} ${horaOficial}`, "DD/MM/YYYY HH:mm:ss");
  var nuevaFechaHoraOficial = moment(`${nuevaFecha} ${nuevaHoraOficial}`, "DD/MM/YYYY HH:mm:ss");

  var diferenciaTotal = moment.duration(fechaHoraDvr.diff(fechaHoraOficial));
  var diferenciaTotalSegundos = Math.abs(diferenciaTotal.asSeconds());

  var nuevaFechaHoraDvr;
  if (diferenciaTotal.asSeconds() < 0) {
    nuevaFechaHoraDvr = nuevaFechaHoraOficial.clone().add(diferenciaTotalSegundos, 'seconds');
  } else {
    nuevaFechaHoraDvr = nuevaFechaHoraOficial.clone().subtract(diferenciaTotalSegundos, 'seconds');
  }

  var resultado3 =
    "La hora Oficial es: <span class='difference'>" +
    nuevaFechaHoraDvr.format("DD/MM/YYYY HH:mm:ss") +
    "</span>";

  document.getElementById("nuevoResultado2").innerHTML = resultado3;
}

/*window.addEventListener("blur", function() {
  setTimeout(function() {
    cerrarSesion();
  }, 30000);
});*/
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

document.addEventListener('DOMContentLoaded', function () {
    const app = document.getElementById('app');
    let touchstartY = 0;
    let touchendY = 0;

    app.addEventListener('touchstart', function (e) {
        touchstartY = e.changedTouches[0].screenY;
    }, false);

    app.addEventListener('touchend', function (e) {
        touchendY = e.changedTouches[0].screenY;
        handleGesture();
    }, false);

    function handleGesture() {
        if (touchendY > touchstartY + 50 && window.scrollY === 0) { // Pull down more than 50px from top
            refreshContent();
        }
    }

    function refreshContent() {
        if (typeof Haptics !== 'undefined') {
            Haptics.vibrate();
        }
        location.reload(); // Reload the page
    }
});

