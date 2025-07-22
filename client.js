let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];

function guardarDatos() {
  localStorage.setItem('inventario', JSON.stringify(inventario));
  localStorage.setItem('ventas', JSON.stringify(ventas));
}

function cargarVistaInventario() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = "<h2>Inventario</h2><ul>" +
    inventario.map(p => `<li>${p.nombre} - Cantidad: ${p.cantidad}</li>`).join('') +
    "</ul>";
}

function cargarVistaVentas() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = "<h2>Ventas</h2><ul>" +
    ventas.map(v => `<li>${v.producto} - Cantidad: ${v.cantidad}</li>`).join('') +
    "</ul>";
}

function actualizarEstadisticas() {
  document.getElementById("totalProductos").innerText = inventario.length;
  const vendido = ventas.reduce((acc, v) => acc + parseInt(v.cantidad), 0);
  const disponible = inventario.reduce((acc, p) => acc + parseInt(p.cantidad), 0);
  document.getElementById("totalVendido").innerText = vendido;
  document.getElementById("totalDisponible").innerText = disponible;
}

function inicializarAplicacion() {
  mostrarVista('inventario');
}
