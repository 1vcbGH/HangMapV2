const mapa = L.map('mapa').setView([-32.5228, -55.7658], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

const iconoFiesta = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI0ZGRDcwMCIvPjxwYXRoIGQ9Ik04IDE0QzguNSAxNS41IDEwIDE3IDEyIDE3QzE0IDE3IDE1LjUgMTUuNSAxNiAxNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iOCIgY3k9IjkiIHI9IjEuNSIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iOSIgcj0iMS41IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTkgNkM5IDYgMTAgNCAxMiA0QzE0IDQgMTUgNiAxNSA2IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -30]
});

const lista = document.querySelector(".lista-fiesta");
let coordenadasTemporales = null;
let marcadores = []; // Para guardar referencias a los marcadores

// Credenciales del administrador
const ADMIN_USERNAME = "HANGMAPADMIN";
// Contraseña codificada para que no sea visible directamente
const ADMIN_PASSWORD_ENCODED = "S3pTelA0VzEybHg=";
let adminAutenticado = false;

// Eventos fijos
const eventosIniciales = [
  { lat: -34.8011, lng: -55.5461, nombre: "🎉 Pool Party en Salinas", edad: "18+", horario: "22:00", fecha: "15/05", pago: "gratis", precio: "0", fechaGuardado: Date.now() },
  { lat: -34.767, lng: -55.7514, nombre: "🎉 Beach Party en Atlántida", edad: "18+", horario: "23:00", fecha: "18/05", pago: "pago", precio: "200", fechaGuardado: Date.now() },
  { lat: -34.7194, lng: -55.8671, nombre: "🎶 Noche de Techno en San Jacinto", edad: "21+", horario: "00:00", fecha: "20/05", pago: "pago", precio: "300", fechaGuardado: Date.now() },
  { lat: -34.7302, lng: -56.2194, nombre: "🏠 Fiesta en Casa en Las Piedras", edad: "Todas", horario: "21:00", fecha: "12/05", pago: "gratis", precio: "0", fechaGuardado: Date.now() }
];

// Comprobar si hay eventos iniciales guardados
async function inicializarEventos() {
  try {
    // Verificar si hay fiestas en el servidor
    const respuesta = await fetch('/api/fiestas');
    if (!respuesta.ok) {
      throw new Error('Error al obtener las fiestas del servidor');
    }
    
    const fiestas = await respuesta.json();
    
    // Si no hay fiestas, añadir las iniciales
    if (fiestas.length === 0) {
      // Agregar cada fiesta inicial al servidor
      for (const fiesta of eventosIniciales) {
        await fetch('/api/fiestas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fiesta)
        });
      }
      console.log("Eventos iniciales añadidos al servidor");
    }
  } catch (error) {
    console.error("Error al inicializar eventos:", error);
  }
}

// Ejecutar la inicialización al cargar la página
inicializarEventos();

function mostrarEvento(evt, id) {
  const ahora = Date.now();
  const diasExpiracion = parseInt(evt.expiracion || 7);
  const fechaExpiracion = new Date(evt.fechaGuardado + diasExpiracion * 24 * 60 * 60 * 1000);
  const fechaExpiracionFormateada = fechaExpiracion.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const popup = `
    <b>${evt.nombre}</b><br>
    🗓 ${evt.fecha || "Sin fecha"} - 🕒 ${evt.horario || "Sin hora"}<br>
    🎯 Edad: ${evt.edad || "Todas"}<br>
    💰 ${evt.pago === "pago" ? `$${evt.precio}` : "Gratis"}<br>
    ⏳ Expira el: ${fechaExpiracionFormateada}
  `;

  const marcador = L.marker([evt.lat, evt.lng], { icon: iconoFiesta }).addTo(mapa)
    .bindPopup(popup);
  
  // Guardar referencia al marcador
  marcadores.push({
    id: id,
    marcador: marcador
  });

  const li = document.createElement("li");
  li.innerHTML = `📍 ${evt.nombre} - ${evt.fecha || ""} (Expira el: ${fechaExpiracionFormateada})`;
  lista.appendChild(li);
}

function limpiarMarcadores() {
  // Limpiar todos los marcadores del mapa
  marcadores.forEach(m => mapa.removeLayer(m.marcador));
  marcadores = [];
  
  // Limpiar la lista de fiestas
  lista.innerHTML = "";
}

async function cargarFiestasGuardadas() {
  limpiarMarcadores();
  
  try {
    // Obtener las fiestas del servidor
    const respuesta = await fetch('/api/fiestas');
    if (!respuesta.ok) {
      throw new Error('Error al obtener las fiestas del servidor');
    }
    
    const guardadas = await respuesta.json();
    const ahora = Date.now();
    
    // Filtrar eventos expirados
    const activas = guardadas.filter(evt => {
      const diasExpiracion = parseInt(evt.expiracion || 7);
      return ahora - evt.fechaGuardado < diasExpiracion * 24 * 60 * 60 * 1000;
    });
    
    // Mostrar fiestas activas
    activas.forEach((evt, index) => mostrarEvento(evt, index));
  } catch (error) {
    console.error("Error al cargar las fiestas:", error);
  }
}

// Carga inicial
cargarFiestasGuardadas();

mapa.on('click', function (e) {
  coordenadasTemporales = e.latlng;
  abrirModal();
});

// Modal de agregar fiesta
function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("formularioFiesta").reset();
  document.getElementById("precio").style.display = "none";
}

document.getElementById("pago").addEventListener("change", function () {
  const precio = document.getElementById("precio");
  precio.style.display = this.value === "pago" ? "block" : "none";
});

document.getElementById("formularioFiesta").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const edad = document.getElementById("edad").value;
  const horario = document.getElementById("horario").value;
  const fecha = document.getElementById("fecha").value;
  const pago = document.getElementById("pago").value;
  const precioInput = document.getElementById("precio");
  const precio = pago === "pago" ? precioInput.value : "0";
  const expiracion = document.getElementById("expiracion").value;

  const nuevaFiesta = {
    lat: coordenadasTemporales.lat,
    lng: coordenadasTemporales.lng,
    nombre,
    edad,
    horario,
    fecha,
    pago,
    precio,
    expiracion,
    fechaGuardado: Date.now()
  };

  try {
    // Guardar la fiesta en el servidor
    const respuesta = await fetch('/api/fiestas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaFiesta)
    });

    if (!respuesta.ok) {
      throw new Error('Error al guardar la fiesta en el servidor');
    }

    await cargarFiestasGuardadas();
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar la fiesta:", error);
    alert("Hubo un error al guardar la fiesta. Por favor, inténtalo de nuevo.");
  }
});

// Funciones de administrador
const btnAdmin = document.getElementById("btnAdmin");
const modalAdmin = document.getElementById("modalAdmin");
const panelAdmin = document.getElementById("panelAdmin");
const formularioAdmin = document.getElementById("formularioAdmin");
const mensajeError = document.getElementById("mensajeError");

btnAdmin.addEventListener("click", function() {
  if (adminAutenticado) {
    abrirPanelAdmin();
  } else {
    abrirModalAdmin();
  }
});

function abrirModalAdmin() {
  modalAdmin.style.display = "flex";
}

function cerrarModalAdmin() {
  modalAdmin.style.display = "none";
  formularioAdmin.reset();
  mensajeError.style.display = "none";
}

function abrirPanelAdmin() {
  // Cargar las fiestas en el panel admin
  cargarFiestasAdmin();
  panelAdmin.style.display = "flex";
}

function cerrarPanelAdmin() {
  panelAdmin.style.display = "none";
}

function cerrarSesionAdmin() {
  adminAutenticado = false;
  cerrarPanelAdmin();
}

// Función para hashear contraseñas usando SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Función para decodificar la contraseña codificada
function decodePassword(encoded) {
  try {
    return atob(encoded);
  } catch (e) {
    console.error("Error decodificando");
    return "";
  }
}

formularioAdmin.addEventListener("submit", function(e) {
  e.preventDefault();
  
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;
  
  // Decodificamos la contraseña almacenada para compararla
  const decodedPassword = decodePassword(ADMIN_PASSWORD_ENCODED);
  
  if (usuario === ADMIN_USERNAME && password === decodedPassword) {
    adminAutenticado = true;
    cerrarModalAdmin();
    abrirPanelAdmin();
  } else {
    mensajeError.textContent = "Usuario o contraseña incorrectos";
    mensajeError.style.display = "block";
  }
});

async function cargarFiestasAdmin() {
  const listaAdmin = document.getElementById("listaAdmin");
  listaAdmin.innerHTML = "";
  
  try {
    // Obtener las fiestas del servidor
    const respuesta = await fetch('/api/fiestas');
    if (!respuesta.ok) {
      throw new Error('Error al obtener las fiestas del servidor');
    }
    
    const fiestas = await respuesta.json();
    
    if (fiestas.length === 0) {
      listaAdmin.innerHTML = "<li>No hay fiestas registradas</li>";
      return;
    }
    
    fiestas.forEach((fiesta, index) => {
      const fechaExpiracion = new Date(fiesta.fechaGuardado + (parseInt(fiesta.expiracion || 7) * 24 * 60 * 60 * 1000));
      const fechaExpiracionFormateada = fechaExpiracion.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="detalle-fiesta">
          <strong>${fiesta.nombre}</strong><br>
          🗓 ${fiesta.fecha || "Sin fecha"} - 🕒 ${fiesta.horario || "Sin hora"}<br>
          🎯 Edad: ${fiesta.edad || "Todas"} - 
          💰 ${fiesta.pago === "pago" ? `$${fiesta.precio}` : "Gratis"}<br>
          📍 Coordenadas: Lat ${fiesta.lat.toFixed(4)}, Lng ${fiesta.lng.toFixed(4)}<br>
          ⏳ Expira el: ${fechaExpiracionFormateada}
        </div>
        <button class="boton-eliminar" data-index="${index}">Eliminar</button>
      `;
      
      listaAdmin.appendChild(li);
    });
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll(".boton-eliminar").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = parseInt(this.getAttribute("data-index"));
        eliminarFiesta(index);
      });
    });
  } catch (error) {
    console.error("Error al cargar las fiestas para el admin:", error);
    listaAdmin.innerHTML = "<li>Error al cargar las fiestas</li>";
  }
}

async function eliminarFiesta(index) {
  if (confirm("¿Estás seguro de que deseas eliminar esta fiesta?")) {
    try {
      // Eliminar la fiesta del servidor
      const respuesta = await fetch(`/api/fiestas/${index}`, {
        method: 'DELETE'
      });
      
      if (!respuesta.ok) {
        throw new Error('Error al eliminar la fiesta del servidor');
      }
      
      // Recargar la lista en el panel admin
      await cargarFiestasAdmin();
      
      // Recargar los marcadores en el mapa
      await cargarFiestasGuardadas();
    } catch (error) {
      console.error("Error al eliminar la fiesta:", error);
      alert("Hubo un error al eliminar la fiesta. Por favor, inténtalo de nuevo.");
    }
  }
}
