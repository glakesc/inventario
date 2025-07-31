let productos = JSON.parse(localStorage.getItem("productos")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

function guardarDatos() {
  localStorage.setItem("productos", JSON.stringify(productos));
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

function inicializarAplicacion() {
  mostrarVista("inventario");
}

function mostrarVista(vista) {
  if (vista === "inventario") cargarVistaInventario();
  if (vista === "ventas") cargarVistaVentas();
  if (vista === "estadisticas") actualizarEstadisticas();
}
function cargarVistaInventario() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <h3>Gestión de Inventario</h3>
    <div class="row mb-3">
      <div class="col"><input id="nombre" class="form-control" placeholder="Referencia"></div>
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
          <th>Referencia</th>
          <th>Cantidad</th>
          <th>Ubicación</th>
          <th>Precio (COP)</th>
          <th>Imagen</th>
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
        <td>$ ${p.precio?.toLocaleString()}</td>
        <td>${p.imagen ? `<img src="${p.imagen}" onclick="verImagen('${p.imagen}')" style="height: 120px">` : ""}</td>
        <td><button class="btn btn-danger btn-sm" onclick="eliminarProducto('${p.nombre}')">Eliminar</button></td>
      </tr>
    `;
  }
  document.getElementById("totalInventario").innerText = total;
}
function cargarVistaVentas() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = `
    <h3>Registro de Ventas</h3>
    <div class="row mb-3">
      <div class="col"><input id="productoV" class="form-control" placeholder="Referencia producto"></div>
      <div class="col"><input id="nombreClienteV" class="form-control" placeholder="Nombre cliente"></div>
      <div class="col"><input id="apellidoClienteV" class="form-control" placeholder="Apellido cliente"></div>
      <div class="col"><input id="direccionClienteV" class="form-control" placeholder="Dirección"></div>
      <div class="col"><input id="cantidadV" class="form-control" placeholder="Cantidad" type="number"></div>
      <div class="col"><input id="vendedorV" class="form-control" placeholder="Vendedor"></div>
      <div class="col"><button class="btn btn-primary" onclick="registrarVenta()">Registrar Venta</button></div>
    </div>
    <table class="table table-bordered">
      <thead class="table-light">
        <tr>
          <th>Producto</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Dirección</th>
          <th>Cantidad</th>
          <th>Vendedor</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody id="tablaVentas"></tbody>
    </table>
  `;
  renderVentas();
}

function registrarVenta() {
  const producto = document.getElementById("productoV").value;
  const nombre = document.getElementById("nombreClienteV").value;
  const apellido = document.getElementById("apellidoClienteV").value;
  const direccion = document.getElementById("direccionClienteV").value;
  const cantidad = parseInt(document.getElementById("cantidadV").value);
  const vendedor = document.getElementById("vendedorV").value;
  const fecha = new Date().toLocaleDateString();

  if (!producto || !nombre || !apellido || !direccion || isNaN(cantidad) || !vendedor)
    return alert("Datos incompletos");

  const idx = productos.findIndex(p => p.nombre === producto);
  if (idx === -1 || productos[idx].cantidad < cantidad) {
    return alert("Producto no existe o cantidad insuficiente");
  }

  productos[idx].cantidad -= cantidad;
  ventas.push({ producto, nombre, apellido, direccion, cantidad, vendedor, fecha });
  guardarDatos();
  renderInventario();
  renderVentas();
}

function renderVentas() {
  const tabla = document.getElementById("tablaVentas");
  if (!tabla) return;
  tabla.innerHTML = "";
  for (let v of ventas) {
    tabla.innerHTML += `
      <tr>
        <td>${v.producto}</td>
        <td>${v.nombre}</td>
        <td>${v.apellido}</td>
        <td>${v.direccion}</td>
        <td>${v.cantidad}</td>
        <td>${v.vendedor}</td>
        <td>${v.fecha}</td>
      </tr>`;
  }
}
function actualizarEstadisticas() {
  const cont = document.getElementById("contenido");
  const vendidos = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  const dinero = ventas.reduce((acc, v) => {
    const prod = productos.find(p => p.nombre === v.producto);
    return acc + ((prod?.precio || 0) * v.cantidad);
  }, 0);

  cont.innerHTML = `
    <h3>Estadísticas</h3>
    <ul class="list-group">
      <li class="list-group-item">Total vendido: <strong>${vendidos}</strong> unidades</li>
      <li class="list-group-item">Total en ventas: <strong>$${dinero.toLocaleString()}</strong> COP</li>
    </ul>
  `;
}

function exportarCSV() {
  const filas = productos.map(p => [p.nombre, p.cantidad, p.ubicacion, p.precio]);
  const csv = ["Referencia,Cantidad,Ubicacion,Precio"].concat(filas.map(f => f.join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.csv";
  a.click();
}

function verImagen(src) {
  const w = window.open();
  w.document.write(`<img src="${src}" style="width:100%">`);
}
