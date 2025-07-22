// client.js

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

function guardarDatos() {
  localStorage.setItem("productos", JSON.stringify(productos));
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

function inicializarAplicacion() {
  mostrarVista("inventario");
}

function cargarVistaInventario() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <h3>Gestión de Inventario</h3>
    <div class="row mb-3">
      <div class="col"><input id="nombre" class="form-control" placeholder="Nombre"></div>
      <div class="col"><input id="cantidad" class="form-control" placeholder="Cantidad" type="number"></div>
      <div class="col"><input id="ubicacion" class="form-control" placeholder="Ubicación"></div>
      <div class="col"><input id="precio" class="form-control" placeholder="Precio (COP)" type="number"></div>
      <div class="col"><input id="imagen" class="form-control" type="file" accept="image/*"></div>
      <div class="col">
        <button class="btn btn-primary" onclick="agregarProducto()">Agregar / Actualizar</button>
        <button class="btn btn-secondary" onclick="exportarCSV()">Exportar CSV</button>
      </div>
    </div>
    <h5>Total de inventario restante: <span id="totalInventario"></span></h5>
    <table class="table table-bordered table-striped">
      <thead class="table-light">
        <tr>
          <th>Nombre <input oninput="filtrarTabla(this, 0)"></th>
          <th>Cantidad <input oninput="filtrarTabla(this, 1)"></th>
          <th>Ubicación <input oninput="filtrarTabla(this, 2)"></th>
          <th>Precio (COP) <input oninput="filtrarTabla(this, 3)"></th>
          <th>Imagen</th>
          <th>Cliente</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="tablaInventario"></tbody>
    </table>
  `;
  renderInventario();
}

function agregarProducto() {
  const nombre = document.getElementById("nombre").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const ubicacion = document.getElementById("ubicacion").value;
  const precio = parseInt(document.getElementById("precio").value);
  const imagenInput = document.getElementById("imagen");

  if (!nombre || isNaN(cantidad)) return alert("Datos incompletos");

  const reader = new FileReader();
  reader.onload = function () {
    const imagen = imagenInput.files.length ? reader.result : null;
    const idx = productos.findIndex(p => p.nombre === nombre);
    if (idx >= 0) {
      productos[idx].cantidad += cantidad;
    } else {
      productos.push({ nombre, cantidad, ubicacion, precio, imagen });
    }
    guardarDatos();
    renderInventario();
  };
  if (imagenInput.files.length > 0) reader.readAsDataURL(imagenInput.files[0]);
  else reader.onload();
}

function eliminarProducto(nombre) {
  productos = productos.filter(p => p.nombre !== nombre);
  guardarDatos();
  renderInventario();
}

function renderInventario() {
  const tabla = document.getElementById("tablaInventario");
  tabla.innerHTML = "";
  let total = 0;
  for (let p of productos) {
    total += p.cantidad;
    tabla.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>${p.ubicacion}</td>
        <td>$ ${p.precio.toLocaleString()}</td>
        <td>${p.imagen ? `<img src="${p.imagen}" onclick="verImagen('${p.imagen}')">` : ""}</td>
        <td></td>
        <td><button class="btn btn-danger btn-sm" onclick="eliminarProducto('${p.nombre}')">Eliminar</button></td>
      </tr>
    `;
  }
  document.getElementById("totalInventario").innerText = total;
}

function filtrarTabla(input, colIndex) {
  const filtro = input.value.toLowerCase();
  const filas = document.querySelectorAll("#tablaInventario tr");
  filas.forEach(f => {
    const celdas = f.getElementsByTagName("td");
    f.style.display = celdas[colIndex].innerText.toLowerCase().includes(filtro) ? "" : "none";
  });
}

function verImagen(src) {
  const w = window.open();
  w.document.write(`<img src="${src}" style="width:100%">`);
}

function exportarCSV() {
  const filas = productos.map(p => [p.nombre, p.cantidad, p.ubicacion, p.precio]);
  const csv = ["Nombre,Cantidad,Ubicacion,Precio"].concat(filas.map(f => f.join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.csv";
  a.click();
}

function cargarVistaVentas() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <h3>Registro de Ventas</h3>
    <div class="row mb-3">
      <div class="col"><input id="productoV" class="form-control" placeholder="Nombre producto"></div>
      <div class="col"><input id="clienteV" class="form-control" placeholder="Cliente"></div>
      <div class="col"><input id="cantidadV" class="form-control" placeholder="Cantidad" type="number"></div>
      <div class="col"><button class="btn btn-primary" onclick="registrarVenta()">Registrar Venta</button></div>
    </div>
    <table class="table table-bordered">
      <thead class="table-light">
        <tr><th>Producto</th><th>Cliente</th><th>Cantidad</th><th>Fecha</th></tr>
      </thead>
      <tbody id="tablaVentas"></tbody>
    </table>
  `;
  renderVentas();
}

function registrarVenta() {
  const producto = document.getElementById("productoV").value;
  const cliente = document.getElementById("clienteV").value;
  const cantidad = parseInt(document.getElementById("cantidadV").value);
  const fecha = new Date().toLocaleDateString();

  if (!producto || !cliente || isNaN(cantidad)) return alert("Datos incompletos");

  const idx = productos.findIndex(p => p.nombre === producto);
  if (idx === -1 || productos[idx].cantidad < cantidad) {
    return alert("Producto no existe o cantidad insuficiente");
  }
  productos[idx].cantidad -= cantidad;
  ventas.push({ producto, cliente, cantidad, fecha });
  guardarDatos();
  renderInventario();
  renderVentas();
}

function renderVentas() {
  const tabla = document.getElementById("tablaVentas");
  if (!tabla) return;
  tabla.innerHTML = "";
  for (let v of ventas) {
    tabla.innerHTML += `<tr><td>${v.producto}</td><td>${v.cliente}</td><td>${v.cantidad}</td><td>${v.fecha}</td></tr>`;
  }
}

function actualizarEstadisticas() {
  let total = productos.reduce((acc, p) => acc + p.cantidad, 0);
  let vendidos = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  let registrados = total + vendidos;
  document.getElementById("totalProductos").innerText = registrados;
  document.getElementById("totalVendido").innerText = vendidos;
  document.getElementById("totalDisponible").innerText = total;
}
