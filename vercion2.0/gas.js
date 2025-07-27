const SPREADSHEET_ID        = '1205IdxQVlyoTV7b8JGMh67_Y2Ha6pw-gDbUbcxVAksw';
const SHEET_NAME_ALMACEN    = 'Almacen';
const SHEET_NAME_COCINA     = 'Cocina';
const SHEET_NAME_ADMIN      = 'Administracion';
const SHEET_NAME_COMPRAS  = 'Compras';
const SHEET_NAME_VENTAS     = 'Ventas';

// —————— RUTINA PRINCIPAL ——————
function handleRequest(params) {
  const op = params.op;
  switch (op) {
    // Almacén
    case 'obtenerAlmacen':        return obtenerAlmacen();
    case 'guardarAlmacen':        return guardarAlmacen(params);
    case 'eliminarAlmacen':       return eliminarAlmacen(params.codigo);

    // Cocina
    case 'obtenerCocina':         return obtenerCocina();
    case 'guardarCocina':         return guardarCocina(params);
    case 'eliminarCocina':        return eliminarCocina(params.codigo);

    // Administración
    case 'obtenerAdministracion': return obtenerAdministracion();

    // Compras
    case 'obtenerCompras':        return obtenerCompras();
    case 'guardarCompras':        return guardarCompras(params);
    case 'eliminarCompras':       return eliminarCompras(params);


    // Ventas
    case 'obtenerVentas':           return obtenerVentas();
    case 'guardarVentas':            return guardarVentas(params);
    case 'eliminarVentas':           return eliminarVentas(params);

    default:
      return { status: 'error', message: 'Operación no reconocida: ' + op };
  }
}

function doGet(e) {
  const result = handleRequest(e.parameter || {});
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const result = handleRequest(e.parameter || {});
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// —————— ALMACÉN ——————
function obtenerAlmacen() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_ALMACEN);
  if (!sh) return { status: 'error', message: 'Hoja Almacén no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  const productos = rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      codigo:              parseInt(r[0], 10),
      name:                r[1],
      precio:              parseFloat(r[2]) || 0,
      cantidad:            String(r[3]),
      unidadDeMedida:      String(r[4]),
      stockRecomendado:    String(r[5]),
      proveedor:           String(r[6] || '')
    }));

  return { status: 'success', data: productos };
}

function guardarAlmacen(params) {
  const codigo              = parseInt(params.codigo, 10);
  const name                = params.name;
  const precio              = parseFloat(params.precio) || 0;
  const cantidad            = params.cantidad;
  const unidadDeMedida      = params.unidadDeMedida;
  const stockRecomendado    = params.stockRecomendado;
  const proveedor           = params.proveedor || '';

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_ALMACEN);
  if (!sh) return { status: 'error', message: 'Hoja Almacén no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  const idx = rows.findIndex(r => parseInt(r[0], 10) === codigo);

  if (idx >= 0) {
    const fila = idx + 2;
    sh.getRange(fila, 2).setValue(name);
    sh.getRange(fila, 3).setValue(precio);
    sh.getRange(fila, 4).setValue(cantidad);
    sh.getRange(fila, 5).setValue(unidadDeMedida);
    sh.getRange(fila, 6).setValue(stockRecomendado);
    sh.getRange(fila, 7).setValue(proveedor);
    return { status: 'success', action: 'actualizado', codigo };
  } else {
    sh.appendRow([codigo, name, precio, cantidad, unidadDeMedida, stockRecomendado, proveedor]);
    return { status: 'success', action: 'insertado', codigo };
  }
}

function eliminarAlmacen(codigo) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_ALMACEN);
  if (!sh) return { status: 'error', message: 'Hoja Almacén no encontrada' };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0], 10) === parseInt(codigo, 10)) {
      sh.deleteRow(i + 1);
      return { status: 'success', action: 'eliminado', codigo };
    }
  }
  return { status: 'error', message: 'Producto no encontrado: ' + codigo };
}


// —————— COCINA ——————
function obtenerCocina() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COCINA);
  if (!sh) return { status: 'error', message: 'Hoja Cocina no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  const recetas = rows
    .filter(r => r[0] && r[1])
    .map(r => ({
      codigo:       r[0].toString(),
      nombre:       r[1],
      ingredientes: JSON.parse(r[2] || '[]'),
      imagen:       r[3] || '',
      categoria:    r[4] || ''
    }));

  return { status: 'success', data: recetas };
}


function guardarCocina(params) {
  const codigo     = params.codigo.toString();
  const nombre     = params.nombre;
  let ingredientes;
  try {
    ingredientes = JSON.parse(params.ingredientes);
  } catch (e) {
    return { status: 'error', message: 'Ingredientes inválidos: debe ser JSON' };
  }
  const imagen    = params.imagen    || '';
  const categoria = params.categoria || '';

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COCINA);
  if (!sh) return { status: 'error', message: 'Hoja Cocina no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  const idx = rows.findIndex(r => r[0].toString() === codigo);

  if (idx >= 0) {
    // Actualizar fila existente
    const fila = idx + 2;
    sh.getRange(fila, 2).setValue(nombre);
    sh.getRange(fila, 3).setValue(JSON.stringify(ingredientes));
    sh.getRange(fila, 4).setValue(imagen);
    sh.getRange(fila, 5).setValue(categoria);
    return { status: 'success', action: 'actualizado', codigo };
  } else {
    // Insertar nueva fila
    sh.appendRow([
      codigo,
      nombre,
      JSON.stringify(ingredientes),
      imagen,
      categoria
    ]);
    return { status: 'success', action: 'insertado', codigo };
  }
}

/**
 * Elimina la receta cuyo código coincida.
 */
function eliminarCocina(codigo) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COCINA);
  if (!sh) return { status: 'error', message: 'Hoja Cocina no encontrada' };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === codigo.toString()) {
      sh.deleteRow(i + 1);
      return { status: 'success', action: 'eliminado', codigo };
    }
  }
  return { status: 'error', message: 'Receta no encontrada: ' + codigo };
}


// —————— ADMINISTRACIÓN ——————
function obtenerAdministracion() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_ADMIN);
  if (!sh) return { status:'error', message:'Hoja Administracion no encontrada' };
  const data = sh.getDataRange().getValues();
  const headers = data.shift();
  const datos = data.map(r => ({
    fecha:    r[0],
    concepto: r[1],
    monto:    parseFloat(r[2]) || 0
  }));
  return { status:'success', data:datos };
}

// —————— COMPRAS ——————

/**
 * Obtiene todas las compras, con sus IDs de compra y producto.
 */
function obtenerCompras() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COMPRAS);
  if (!sh) return { status: 'error', message: 'Hoja Compras no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  const compras = rows.map(r => ({
    idCompra:   String(r[0]),  // UUID interno de la compra
    idProducto: String(r[1]),  // Código de producto
    fecha:      r[2]
                  ? Utilities.formatDate(new Date(r[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd')
                  : '',
    name:       String(r[3] || ''),
    precio:     parseFloat(r[4]) || 0,
    cantidad:   parseFloat(r[5]) || 0,
    unidad:     String(r[6] || '')
  }));

  return { status: 'success', data: compras };
}

/**
 * Guarda o actualiza una compra: primero busca por idCompra,
 * si existe la edita, si no, inserta una nueva fila.
 */
function guardarCompras(params) {
  const idCompra   = params.idCompra   || Utilities.getUuid();
  const idProducto = String(params.idProducto);
  const fecha      = params.fecha ? new Date(params.fecha) : '';
  const name       = params.name               || '';
  const precio     = parseFloat(params.precio) || 0;
  const cantidad   = parseFloat(params.cantidad) || 0;
  const unidad     = params.unidad             || '';

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COMPRAS);
  if (!sh) return { status: 'error', message: 'Hoja Compras no encontrada' };

  const [headers, ...rows] = sh.getDataRange().getValues();
  // Busco por idCompra
  const filaIdx = rows.findIndex(r => String(r[0]) === idCompra);

  if (filaIdx >= 0) {
    // Actualizar fila existente
    const fila = filaIdx + 2;
    sh.getRange(fila, 2).setValue(idProducto);
    sh.getRange(fila, 3).setValue(fecha);
    sh.getRange(fila, 4).setValue(name);
    sh.getRange(fila, 5).setValue(precio);
    sh.getRange(fila, 6).setValue(cantidad);
    sh.getRange(fila, 7).setValue(unidad);
    return { status: 'success', action: 'actualizado', idCompra };
  }

  // Si no existe, inserto nueva fila
  // Columnas: idCompra | idProducto | Fecha | Nombre | Precio | Cantidad | Unidad
  sh.appendRow([idCompra, idProducto, fecha, name, precio, cantidad, unidad]);
  return { status: 'success', action: 'insertado', idCompra };
}

/**
 * Elimina compras según parámetros:
 * - Si sólo recibes idCompra, borra todas las filas con ese idCompra.
 * - Si además recibes idProducto, borra sólo la fila que coincida con ambos IDs.
 */
function eliminarCompras(params) {
  const idCompra   = params.idCompra;
  const idProducto = params.idProducto;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_COMPRAS);
  if (!sh) return { status:'error', message:'Hoja Compras no encontrada' };

  const data = sh.getDataRange().getValues();
  let filasBorradas = 0;

  // Recorremos de abajo hacia arriba para no desfasar índices al borrar
  for (let i = data.length - 1; i >= 1; i--) {
    const fila = data[i];
    const mismaCompra  = String(fila[0]) === idCompra;
    const mismoProducto = idProducto 
      ? (String(fila[1]) === idProducto) 
      : true;

    if (mismaCompra && mismoProducto) {
      sh.deleteRow(i + 1);
      filasBorradas++;
      // Si estamos borrando sólo un producto, salimos tras la primera coincidencia
      if (idProducto) break;
    }
  }

  if (filasBorradas === 0) {
    return {
      status: 'error',
      message: idProducto
        ? `No se encontró compra ${idCompra} con producto ${idProducto}`
        : `No se encontraron compras con idCompra ${idCompra}`
    };
  }
  return {
    status: 'success',
    action: idProducto ? 'producto eliminado' : 'compra(s) eliminada(s)',
    idCompra,
    ...(idProducto && { idProducto }),
    filasBorradas
  };
}



/**
 * Obtiene todas las ventas, incluyendo su ID único.
 */
function obtenerVentas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_VENTAS);
  if (!sh) return { status: 'error', message: 'Hoja Ventas no encontrada' };

  // Columnas: ID | Fecha | JSON de items | MetodoPago
  const [headers, ...rows] = sh.getDataRange().getValues();
  const ventas = rows
    .filter(r => r[0] && r[2])  // hay ID y hay items
    .map(r => {
      const id         = r[0];
      const fecha      = r[1];
      let items;
      try {
        items = JSON.parse(r[2]);
      } catch (e) {
        items = { error: 'JSON inválido', raw: r[2] };
      }
      const metodoPago = r[3] || '';  // columna D
      return { id, fecha, venta: items, metodoPago };
    });

  return { status: 'success', data: ventas };
}


function guardarVentas(params) {
  let ventaObj;
  try {
    ventaObj = JSON.parse(params.venta);
  } catch (e) {
    return { status: 'error', message: 'JSON de venta inválido' };
  }
  const id          = ventaObj.id || Utilities.getUuid();
  const fecha       = ventaObj.fecha;
  const items       = ventaObj.items;
  const metodoPago  = ventaObj.metodoPago || '';  // <-- nuevo campo

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_VENTAS);
  if (!sh) return { status: 'error', message: 'Hoja Ventas no encontrada' };

  // Obtener todos los datos para buscar si ya existe el ID
  const data = sh.getDataRange().getValues();
  const rowIndex = data.findIndex((r, i) => i > 0 && r[0] === id);

  const itemsJson = JSON.stringify(items);
  if (rowIndex > -1) {
    // Actualizar la fila existente
    const fila = rowIndex + 1;
    sh.getRange(fila, 2).setValue(fecha);         // Columna B
    sh.getRange(fila, 3).setValue(itemsJson);     // Columna C
    sh.getRange(fila, 4).setValue(metodoPago);    // Columna D (nuevo)
    return { status: 'success', action: 'actualizado', id };
  } else {
    // Insertar nueva fila al final, incluyendo metodoPago en la columna D
    sh.appendRow([ id, fecha, itemsJson, metodoPago ]);
    return { status: 'success', action: 'insertado', id };
  }
}



/**
 * Elimina una venta por ID.
 */
function eliminarVentas(params) {
  const id = params.id;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME_VENTAS);
  if (!sh) return { status: 'error', message: 'Hoja Ventas no encontrada' };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sh.deleteRow(i + 1);
      return { status: 'success', action: 'eliminado', id };
    }
  }
  return { status: 'error', message: 'Venta no encontrada para ID: ' + id };
}
