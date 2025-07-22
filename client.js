function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  console.log("Login recibido:", data?.email);
  alert("Login recibido: " + data?.email);

  const CORREO_AUTORIZADO = "gilmar.lagosc@gmail.com";
  if (!data || !data.email_verified || data.email !== CORREO_AUTORIZADO) {
    alert("Acceso restringido solo a usuarios autorizados.");
    return;
  }

  document.getElementById("loginOverlay").style.display = "none";
  iniciarTemporizadorInactividad();
  mostrarVista('inventario');
}

function mostrarVista(vista) {
  const contenedor = document.getElementById("contenido");
  if (vista === "inventario") renderInventario(contenedor);
  if (vista === "ventas") renderVentas(contenedor);
}

function renderInventario(contenedor) {
  const html = `
    <h2>Gestión de Inventario</h2>
    <form id="itemForm">
      <input type="text" id="nombre" placeholder="Nombre" required />
      <input type="number" id="cantidad" placeholder="Cantidad" required />
      <input type="text" id="ubicacion" placeholder="Ubicación" required />
      <input type="number" id="precio" placeholder="Precio (COP)" required />
      <input type="file" id="imagen" accept="image/*" required />
      <label><input type="checkbox" id="vendido"> ¿Producto vendido?</label>
      <div id="datosCliente" style="display:none; margin-top:10px">
        <input type="text" id="clienteNombre" placeholder="Nombre cliente" />
        <input type="text" id="clienteDireccion" placeholder="Dirección" />
        <input type="text" id="clienteBarrio" placeholder="Barrio" />
        <input type="text" id="clienteTelefono" placeholder="Teléfono" />
      </div>
      <button type="submit">Agregar / Actualizar</button>
      <button type="button" onclick="exportarCSV()">Exportar CSV</button>
    </form>
    <h3 id="totalRestante"></h3>
    <table id="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cantidad</th>
          <th>Ubicación</th>
          <th>Precio (COP)</th>
          <th>Imagen</th>
          <th>Cliente</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.innerHTML = html;

  document.getElementById("vendido").addEventListener("change", function() {
    document.getElementById("datosCliente").style.display = this.checked ? "block" : "none";
  });

  document.getElementById("itemForm").onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const ubicacion = document.getElementById("ubicacion").value;
    const precio = parseInt(document.getElementById("precio").value);
    const imagenInput = document.getElementById("imagen");
    const vendido = document.getElementById("vendido").checked;

    const cliente = vendido ? {
      nombre: document.getElementById("clienteNombre").value,
      direccion: document.getElementById("clienteDireccion").value,
      barrio: document.getElementById("clienteBarrio").value,
      telefono: document.getElementById("clienteTelefono").value
    } : null;

    const reader = new FileReader();
    reader.onload = function () {
      const nueva = { nombre, cantidad, ubicacion, precio, imagen: reader.result, cliente };
      const datos = JSON.parse(localStorage.getItem("inventario") || "[]");
      const index = datos.findIndex(d => d.nombre === nombre);
      if (index >= 0) datos[index] = nueva;
      else datos.push(nueva);
      localStorage.setItem("inventario", JSON.stringify(datos));
      renderTable();
      document.getElementById("itemForm").reset();
      document.getElementById("datosCliente").style.display = "none";
    };
    reader.readAsDataURL(imagenInput.files[0]);
  };

  renderTable();
}

function renderVentas(contenedor) {
  const datos = JSON.parse(localStorage.getItem("inventario") || "[]");
  const vendidos = datos.filter(d => d.cliente);
  let html = "<h2>Ventas realizadas</h2><table><thead><tr><th>Producto</th><th>Cliente</th><th>Teléfono</th><th>Barrio</th></tr></thead><tbody>";
  vendidos.forEach(v => {
    html += `<tr><td>${v.nombre}</td><td>${v.cliente.nombre}</td><td>${v.cliente.telefono}</td><td>${v.cliente.barrio}</td></tr>`;
  });
  html += "</tbody></table>";
  contenedor.innerHTML = html;
}

function renderTable() {
  const datos = JSON.parse(localStorage.getItem("inventario") || "[]");
  const tbody = document.querySelector("#tabla tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  let total = 0;
  datos.forEach((d, i) => {
    const cliente = d.cliente ? `${d.cliente.nombre || ''}, ${d.cliente.direccion || ''}, ${d.cliente.barrio || ''}, ${d.cliente.telefono || ''}` : "";
    const fila = tbody.insertRow();
    fila.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.ubicacion}</td>
      <td>${d.precio.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
      <td><img src="${d.imagen}" onclick="mostrarImagen('${d.imagen}')"></td>
      <td>${cliente}</td>
      <td><button onclick="eliminar(${i})">Eliminar</button></td>
    `;
    total += d.cantidad;
  });
  const totalRestante = document.getElementById("totalRestante");
  if (totalRestante) totalRestante.textContent = `Total de inventario restante: ${total}`;
}

function eliminar(i) {
  const datos = JSON.parse(localStorage.getItem("inventario") || "[]");
  datos.splice(i, 1);
  localStorage.setItem("inventario", JSON.stringify(datos));
  renderTable();
}

function mostrarImagen(src) {
  const ventana = window.open("", "Imagen", "width=600,height=400");
  ventana.document.write(`<img src="${src}" style="max-width:100%">`);
}

function exportarCSV() {
  const datos = JSON.parse(localStorage.getItem("inventario") || "[]");
  if (!datos.length) return;
  const encabezado = ["Nombre", "Cantidad", "Ubicación", "Precio", "Cliente", "Dirección", "Barrio", "Teléfono"];
  const filas = datos.map(d => [
    d.nombre,
    d.cantidad,
    d.ubicacion,
    d.precio,
    d.cliente?.nombre || "",
    d.cliente?.direccion || "",
    d.cliente?.barrio || "",
    d.cliente?.telefono || ""
  ]);
  const csv = [encabezado, ...filas].map(f => f.join(",")).join("\\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function iniciarTemporizadorInactividad() {
  let temporizador = setTimeout(() => location.reload(), 5 * 60 * 1000);
  window.addEventListener("mousemove", reset);
  window.addEventListener("keydown", reset);
  function reset() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => location.reload(), 5 * 60 * 1000);
  }
}

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

