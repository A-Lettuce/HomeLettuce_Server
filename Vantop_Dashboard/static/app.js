/**
 * Vantop Dashboard — lógica frontend
 * Llama a las rutas /api/* del backend Flask y renderiza los datos
 */

'use strict';

// Sección actualmente visible (para el auto-refresh inteligente)
let seccionActiva = 'clientes';

// --- Utilidades de formato ---

/**
 * Formatea un número entero como peso chileno: 95000 → "$95.000"
 */
function formatPeso(num) {
  if (isNaN(num) || num === null) return '$0';
  return '$' + Math.round(num).toLocaleString('es-CL');
}

/**
 * Devuelve el HTML del badge según el estado del servicio/cliente
 */
function badgeEstado(estado) {
  const claves = {
    'confirmado': 'badge-confirmado',
    'pendiente': 'badge-pendiente',
    'cotizado': 'badge-cotizado',
    'realizado': 'badge-realizado',
    'cancelado': 'badge-cancelado',
  };
  const cls = claves[(estado || '').toLowerCase()] || 'badge-pendiente';
  return `<span class="badge ${cls}">${estado || '—'}</span>`;
}

/**
 * Actualiza el texto "Actualizado a las HH:MM" en la barra superior
 */
function marcarActualizacion() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('ultima-actualizacion').textContent = `Actualizado a las ${hora}`;
}

// --- Reloj y fecha en la barra superior ---

function actualizarReloj() {
  const ahora = new Date();
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const dia = diasSemana[ahora.getDay()];
  const fecha = `${dia} ${ahora.getDate()} ${meses[ahora.getMonth()]}`;
  const hora = ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  document.getElementById('fecha-actual').textContent = fecha;
  document.getElementById('hora-actual').textContent = hora;
}

// --- Navegación por tabs ---

function iniciarTabs() {
  const botones = document.querySelectorAll('.tab-btn');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.dataset.seccion;
      botones.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
      document.getElementById(`sec-${seccion}`).classList.add('activa');

      seccionActiva = seccion;

      // Cargar datos al cambiar de sección si no se cargaron antes
      if (seccion === 'clientes') cargarClientes();
      if (seccion === 'calendario') cargarCalendario();
      if (seccion === 'finanzas') {
        cargarFinanzas();
        cargarGastos();
      }
    });
  });
}

// --- Resumen del día ---

async function cargarResumen() {
  try {
    const res = await fetch('api/resumen');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    document.getElementById('m-servicios').textContent = data.servicios_hoy;
    document.getElementById('m-proximo').textContent = data.proximo_servicio;
    document.getElementById('m-ingresos').textContent = formatPeso(data.ingresos_hoy);
    document.getElementById('m-leads').textContent = data.leads_pendientes;

    marcarActualizacion();
  } catch (err) {
    console.error('Error al cargar resumen:', err);
  }
}

// --- Clientes ---

let todosLosClientes = [];

async function cargarClientes() {
  const cargando = document.getElementById('cargando-clientes');
  const tabla = document.getElementById('tabla-clientes');
  const sinClientes = document.getElementById('sin-clientes');

  cargando.classList.remove('oculto');
  tabla.classList.add('oculto');
  sinClientes.classList.add('oculto');

  try {
    const res = await fetch('api/clientes');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    todosLosClientes = data;
    renderizarClientes(todosLosClientes);
    marcarActualizacion();
  } catch (err) {
    console.error('Error al cargar clientes:', err);
    cargando.textContent = 'Error al cargar clientes.';
  } finally {
    cargando.classList.add('oculto');
  }
}

function renderizarClientes(lista) {
  const tabla = document.getElementById('tabla-clientes');
  const tbody = document.getElementById('tbody-clientes');
  const sinClientes = document.getElementById('sin-clientes');

  if (!lista || lista.length === 0) {
    tabla.classList.add('oculto');
    sinClientes.classList.remove('oculto');
    return;
  }

  tbody.innerHTML = '';
  lista.forEach(c => {
    const telefono = c['Teléfono'] || '';
    const enlaceWsp = telefono
      ? `<a href="https://wa.me/${telefono.replace(/[^0-9]/g, '')}" target="_blank" class="link-accion">WhatsApp</a>`
      : '—';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c['Cliente'] || '—'}</td>
      <td>${telefono || '—'}</td>
      <td>${c['Fecha viaje'] || '—'}</td>
      <td>${badgeEstado(c['Estado'])}</td>
      <td>${enlaceWsp}</td>
    `;
    tbody.appendChild(tr);
  });

  tabla.classList.remove('oculto');
  sinClientes.classList.add('oculto');
}

// Filtro de clientes en el frontend
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filtro-clientes').addEventListener('input', e => {
    const termino = e.target.value.toLowerCase();
    const filtrados = todosLosClientes.filter(c =>
      (c['Cliente'] || '').toLowerCase().includes(termino) ||
      (c['Teléfono'] || '').includes(termino) ||
      (c['Estado'] || '').toLowerCase().includes(termino) ||
      (c['Ruta'] || '').toLowerCase().includes(termino)
    );
    renderizarClientes(filtrados);
  });
});

// Formulario agregar cliente
function iniciarFormCliente() {
  const form = document.getElementById('form-cliente');
  const btnAbrir = document.getElementById('btn-agregar-cliente');
  const btnCancelar = document.getElementById('btn-cancelar-cliente');
  const btnGuardar = document.getElementById('btn-guardar-cliente');
  const msg = document.getElementById('msg-cliente');

  btnAbrir.addEventListener('click', () => {
    form.classList.toggle('oculto');
    msg.textContent = '';
  });

  btnCancelar.addEventListener('click', () => {
    form.classList.add('oculto');
    limpiarFormCliente();
  });

  btnGuardar.addEventListener('click', async () => {
    const datos = {
      cliente: document.getElementById('fc-nombre').value.trim(),
      telefono: document.getElementById('fc-telefono').value.trim(),
      fecha_viaje: document.getElementById('fc-fecha').value,
      ruta: document.getElementById('fc-ruta').value.trim(),
      monto: document.getElementById('fc-monto').value,
      estado: document.getElementById('fc-estado').value,
      resena_enviada: 'No',
    };

    if (!datos.cliente) {
      msg.textContent = 'El nombre del cliente es obligatorio.';
      msg.className = 'msg-formulario msg-error';
      return;
    }

    try {
      btnGuardar.disabled = true;
      btnGuardar.textContent = 'Guardando...';

      const res = await fetch('api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      msg.textContent = 'Cliente guardado correctamente.';
      msg.className = 'msg-formulario msg-ok';
      limpiarFormCliente();
      await cargarClientes();
      await cargarResumen();

      setTimeout(() => form.classList.add('oculto'), 1500);
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
      msg.className = 'msg-formulario msg-error';
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  });
}

function limpiarFormCliente() {
  ['fc-nombre', 'fc-telefono', 'fc-fecha', 'fc-ruta', 'fc-monto'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fc-estado').value = 'Cotizado';
}

// --- Calendario ---

async function cargarCalendario() {
  const cargando = document.getElementById('cargando-calendario');
  const contenido = document.getElementById('contenido-calendario');

  cargando.classList.remove('oculto');
  contenido.classList.add('oculto');

  try {
    const res = await fetch('api/calendario');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    renderizarEventos('eventos-hoy', data.hoy);
    renderizarEventos('eventos-manana', data.manana);

    contenido.classList.remove('oculto');
    marcarActualizacion();
  } catch (err) {
    console.error('Error al cargar calendario:', err);
    cargando.textContent = 'Error al cargar el calendario.';
  } finally {
    cargando.classList.add('oculto');
  }
}

function renderizarEventos(contenedorId, eventos) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = '';

  if (!eventos || eventos.length === 0) {
    contenedor.innerHTML = '<p class="sin-eventos">Sin servicios programados.</p>';
    return;
  }

  eventos.forEach(ev => {
    const badge = badgeEstado(ev.estado);
    const desc = ev.descripcion ? `<div class="evento-desc">${ev.descripcion}</div>` : '';
    const div = document.createElement('div');
    div.className = 'evento-card';
    div.innerHTML = `
      <div class="evento-hora">${ev.hora}</div>
      <div class="evento-info">
        <div class="evento-titulo">${ev.titulo}</div>
        ${desc}
      </div>
      <div>${badge}</div>
    `;
    contenedor.appendChild(div);
  });
}

// --- Finanzas ---

async function cargarFinanzas() {
  const cargando = document.getElementById('cargando-finanzas');
  const contenido = document.getElementById('contenido-finanzas');

  cargando.classList.remove('oculto');
  contenido.classList.add('oculto');

  try {
    const res = await fetch('api/finanzas');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    document.getElementById('f-ingresos').textContent = formatPeso(data.ingresos_mes);
    document.getElementById('f-gastos').textContent = formatPeso(data.gastos_mes);

    const margenEl = document.getElementById('f-margen');
    const cardMargen = document.getElementById('card-margen');
    margenEl.textContent = formatPeso(data.margen);
    if (data.margen >= 0) {
      cardMargen.classList.add('verde');
      cardMargen.classList.remove('rojo');
    } else {
      cardMargen.classList.add('rojo');
      cardMargen.classList.remove('verde');
    }

    contenido.classList.remove('oculto');
    marcarActualizacion();
  } catch (err) {
    console.error('Error al cargar finanzas:', err);
    cargando.textContent = 'Error al cargar finanzas.';
  } finally {
    cargando.classList.add('oculto');
  }
}

async function cargarGastos() {
  try {
    const res = await fetch('api/gastos');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    const tbody = document.getElementById('tbody-gastos');
    const sinGastos = document.getElementById('sin-gastos');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      sinGastos.classList.remove('oculto');
      return;
    }

    sinGastos.classList.add('oculto');
    // Mostrar los más recientes primero
    [...data].reverse().forEach(g => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g['Fecha'] || '—'}</td>
        <td>${g['Categoría'] || '—'}</td>
        <td>${formatPeso(g['Monto'])}</td>
        <td>${g['Descripción'] || '—'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar gastos:', err);
  }
}

// Formulario registrar gasto
function iniciarFormGasto() {
  const form = document.getElementById('form-gasto');
  const btnAbrir = document.getElementById('btn-agregar-gasto');
  const btnCancelar = document.getElementById('btn-cancelar-gasto');
  const btnGuardar = document.getElementById('btn-guardar-gasto');
  const msg = document.getElementById('msg-gasto');

  // Precargar la fecha de hoy
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fg-fecha').value = hoy;

  btnAbrir.addEventListener('click', () => {
    form.classList.toggle('oculto');
    msg.textContent = '';
  });

  btnCancelar.addEventListener('click', () => {
    form.classList.add('oculto');
    limpiarFormGasto();
  });

  btnGuardar.addEventListener('click', async () => {
    const datos = {
      fecha: document.getElementById('fg-fecha').value,
      categoria: document.getElementById('fg-categoria').value,
      monto: document.getElementById('fg-monto').value,
      descripcion: document.getElementById('fg-descripcion').value.trim(),
    };

    if (!datos.monto || isNaN(datos.monto)) {
      msg.textContent = 'El monto es obligatorio.';
      msg.className = 'msg-formulario msg-error';
      return;
    }

    try {
      btnGuardar.disabled = true;
      btnGuardar.textContent = 'Guardando...';

      const res = await fetch('api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      msg.textContent = 'Gasto registrado correctamente.';
      msg.className = 'msg-formulario msg-ok';
      limpiarFormGasto();
      await cargarGastos();
      await cargarFinanzas();
      await cargarResumen();

      setTimeout(() => form.classList.add('oculto'), 1500);
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
      msg.className = 'msg-formulario msg-error';
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  });
}

function limpiarFormGasto() {
  document.getElementById('fg-monto').value = '';
  document.getElementById('fg-descripcion').value = '';
  document.getElementById('fg-categoria').value = 'Bencina';
  document.getElementById('fg-fecha').value = new Date().toISOString().split('T')[0];
}

// --- Estado OAuth ---

async function verificarOAuth() {
  const chip = document.getElementById('oauth-chip');
  if (!chip) return;
  try {
    const res = await fetch('auth/status');
    const data = await res.json();
    chip.classList.remove('oauth-chip--cargando', 'oauth-chip--conectado', 'oauth-chip--desconectado');
    if (data.conectado) {
      chip.classList.add('oauth-chip--conectado');
      chip.querySelector('.oauth-label').textContent = 'Google conectado';
      chip.removeAttribute('href');
    } else {
      chip.classList.add('oauth-chip--desconectado');
      chip.querySelector('.oauth-label').textContent = 'Conectar Google';
      chip.setAttribute('href', 'auth');
    }
  } catch {
    chip.classList.remove('oauth-chip--cargando');
    chip.classList.add('oauth-chip--desconectado');
    chip.querySelector('.oauth-label').textContent = 'Sin conexión';
  }
}

// --- Inicialización ---

document.addEventListener('DOMContentLoaded', () => {
  actualizarReloj();
  setInterval(actualizarReloj, 60000);

  iniciarTabs();
  iniciarFormCliente();
  iniciarFormGasto();

  verificarOAuth();

  // Cargar datos iniciales
  cargarResumen();
  cargarClientes();
});

// Recargar datos cada 60 segundos sin recargar la página completa
setInterval(() => {
  cargarResumen();
  cargarCalendario();
  if (seccionActiva === 'clientes') cargarClientes();
  if (seccionActiva === 'finanzas') {
    cargarFinanzas();
    cargarGastos();
  }
}, 60000);
