// client.js actualizado

const correoAutorizado = "gilmar.lagosc@gmail.com";
let datos = JSON.parse(localStorage.getItem("datos") || "[]");

function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  if (data.email !== correoAutorizado) return alert("Acceso restringido solo a usuarios autorizados");
  document.getElementById("loginOverlay").style.display = "none";
  inicializarApp();
}

function parseJwt(token) {
  return JSON.parse(atob(token.split(".")[1]));
}

function inicializarApp() {
  document.getElementById("menuLateral").innerHTML = `
    <button onclick="mostrarSeccion('inventario')">Inventario</button>
    <button onclick="mostrarSeccion('ventas')">Ventas</button>
    <button onclick="mostrarSeccion('estadisticas')">Estadísticas</button>
  `;
  mostrarSeccion("inventario");
}

function mostrarSeccion(seccion) {
  const cont = document.getElementById("contenido");
  if (seccion === "inventario") cont.innerHTML = seccionInventario();
  else if (seccion === "ventas") cont.innerHTML = seccionVentas();
  else if (seccion === "estadisticas") cont.innerHTML = "<h2>Estadísticas</h2><p>Próximamente...</p>";
  if (seccion === "inventario") cargarTabla();
}

function seccionInventario() {
  return `
    <h2>Gestión de Inventario</h2>
    <div class="row g-2">
      <div class="col"><input id="nombre" class="form-control" placeholder="Nombre"></div>
      <div class="col"><input id="cantidad" class="form-control" type="number" placeholder="Cantidad"></div>
      <div class="col"><input id="ubicacion" class="form-control" placeholder="Ubicación"></div>
      <div class="col"><input id="precio" class="form-control" type="number" placeholder="Precio (COP)"></div>
      <div class="col"><input id="imagen" class="form-control" type="file"></div>
    </div>
    <button onclick="agregarActualizar()" class="btn btn-primary">Agregar / Actualizar</button>
    <button onclick="exportarCSV()" class="btn btn-secondary">Exportar CSV</button>
    <p class="mt-3"><strong>Total de inventario restante:</strong> <span id="totalInv"></span></p>
    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead><tr>
          <th>Nombre</th><th>Cantidad</th><th>Ubicación</th><th>Precio (COP)</th><th>Imagen</th><th>Cliente</th><th>Acciones</th>
        </tr></thead>
        <tbody id="tabla"></tbody>
      </table>
    </div>
  `;
}

function seccionVentas() {
  return `
    <h2>Registrar Venta</h2>
    <div class="row g-2">
      <div class="col"><input id="nombreVenta" class="form-control" placeholder="Nombre producto"></div>
      <div class="col"><input id="cliente" class="form-control" placeholder="Cliente"></div>
      <div class="col"><input id="cantidadVenta" class="form-control" type="number" placeholder="Cantidad"></div>
    </div>
    <button onclick="registrarVenta()" class="btn btn-success">Registrar Venta</button>
  `;
}

function agregarActualizar() {
  const nombre = v("nombre"), cantidad = +v("cantidad"), ubicacion = v("ubicacion"), precio = +v("precio"), imagenInput = document.getElementById("imagen");
  if (!nombre || isNaN(cantidad)) return alert("Nombre y cantidad requeridos");
  let imagen = "";
  if (imagenInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      imagen = reader.result;
      guardarProducto(nombre, cantidad, ubicacion, precio, imagen);
    };
    return reader.readAsDataURL(imagenInput.files[0]);
  }
  guardarProducto(nombre, cantidad, ubicacion, precio, imagen);
}

function guardarProducto(nombre, cantidad, ubicacion, precio, imagen) {
  const idx = datos.findIndex(d => d.nombre === nombre);
  if (idx >= 0) datos[idx] = {...datos[idx], cantidad, ubicacion, precio, imagen};
  else datos.push({nombre, cantidad, ubicacion, precio, imagen, cliente: ""});
  localStorage.setItem("datos", JSON.stringify(datos));
  mostrarSeccion("inventario");
}

function cargarTabla() {
  let html = "";
  let total = 0;
  for (const d of datos) {
    html += `<tr>
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.ubicacion}</td>
      <td>$ ${d.precio?.toLocaleString("es-CO") || 0}</td>
      <td>${d.imagen ? `<img src="${d.imagen}" onclick="verImagen('${d.imagen}')">` : ""}</td>
      <td>${d.cliente || ""}</td>
      <td><button class="btn btn-danger btn-sm" onclick="eliminar('${d.nombre}')">Eliminar</button></td>
    </tr>`;
    total += d.cantidad;
  }
  qs("#tabla").innerHTML = html;
  qs("#totalInv").textContent = total;
}

function exportarCSV() {
  const encabezados = ["Nombre","Cantidad","Ubicacion","Precio","Cliente"];
  const filas = datos.map(d => [d.nombre, d.cantidad, d.ubicacion, d.precio, d.cliente]);
  const csv = [encabezados, ...filas].map(f => f.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.csv";
  a.click();
}

function registrarVenta() {
  const nombre = v("nombreVenta"), cliente = v("cliente"), cantidad = +v("cantidadVenta");
  const idx = datos.findIndex(d => d.nombre === nombre);
  if (idx < 0) return alert("Producto no encontrado");
  if (datos[idx].cantidad < cantidad) return alert("Stock insuficiente");
  datos[idx].cantidad -= cantidad;
  datos[idx].cliente = cliente;
  localStorage.setItem("datos", JSON.stringify(datos));
  alert("Venta registrada y stock actualizado");
  mostrarSeccion("inventario");
}

function eliminar(nombre) {
  if (!confirm("¿Eliminar este producto?")) return;
  datos = datos.filter(d => d.nombre !== nombre);
  localStorage.setItem("datos", JSON.stringify(datos));
  cargarTabla();
}

function verImagen(src) {
  const img = new Image();
  img.src = src;
  const w = window.open("");
  w.document.write(img.outerHTML);
}

const v = id => document.getElementById(id).value.trim();
const qs = sel => document.querySelector(sel);
