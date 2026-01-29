import { getConnection, sql } from "../config/db.js";
import {
  cFacturaVenta,
  cFacturaCompra,
  cAlbaranVenta,
} from "../models/Factura.js";
import { cQuerysSQL } from "../querys/querysSQL.js";

/**
 * @param {string} serie
 * @param {number} numero
 * @returns {Promise<cFacturaVenta|null>}
 */
export const getFacturasVentas = async (page, limit) => {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const cabeceraFactura = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("LIMIT", sql.Int, limit)
      .query(cQuerysSQL.getFacturasVentas);

    const total = await pool.query(cQuerysSQL.getCountFacturasVentas);

    const totalFacturas = total.recordset[0].total;
    return {
      facturas: cabeceraFactura.recordset.map(
        (factura) => new cFacturaVenta(factura),
      ),
      totalItems: totalFacturas,
      totalPages: Math.ceil(totalFacturas / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getFacturasVentas:", error.message);
    throw error;
  }
};

export const getFacturasCompras = async (page, limit) => {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const cabeceraFactura = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("LIMIT", sql.Int, limit)
      .query(cQuerysSQL.getFacturasCompras);

    const totalFacturas = await pool
      .request()
      .query(cQuerysSQL.getCountFacturasCompras);

    const totalRecords = totalFacturas.recordset[0].total;
    return {
      facturas: cabeceraFactura.recordset.map(
        (factura) => new cFacturaCompra(factura),
      ),
      totalItems: totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getFacturasCompras:", error.message);
    throw error;
  }
};

export const getFacturaVenta = async (serie, numero) => {
  const serieFormateada = serie.trim();

  try {
    const pool = await getConnection();
    const cabeceraFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getFacturaVenta);

    if (cabeceraFactura.recordset.length === 0) {
      return null;
    }

    const dbHeader = cabeceraFactura.recordset[0];

    const detalleFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getDetalleFacturaVenta);

    if (detalleFactura.recordset.length === 0) {
      return null;
    }

    const dbDetail = detalleFactura.recordset;
    //console.log("Detalles de la factura: ", dbDetail[0]);

    if (dbDetail.length > 0 && dbDetail[0].ALMACEN) {
      dbHeader.CODALMACEN = dbDetail[0].ALMACEN;
    } else {
      dbHeader.CODALMACEN = "";
    }

    const factura = new cFacturaVenta(dbHeader, dbDetail);
    //console.log("Factura final: ", factura);
    return factura;
  } catch (error) {
    console.error("Error en getFacturaVenta:", error.message);
    throw error;
  }
};

export const getFacturaCompra = async (serie, numero) => {
  const serieFormateada = serie.trim();

  console.log("Parametros recibidos: ", serieFormateada, numero);

  try {
    const pool = await getConnection();
    const cabeceraFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getFacturaCompra);

    if (cabeceraFactura.recordset.length === 0) {
      return null;
    }

    const dbHeader = cabeceraFactura.recordset[0];

    const detalleFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getDetalleFacturaCompra);

    if (detalleFactura.recordset.length === 0) {
      return null;
    }

    const dbDetail = detalleFactura.recordset;

    const factura = new cFacturaCompra(dbHeader, dbDetail);
    return factura;
  } catch (error) {
    console.error("Error en getFacturaCompra:", error.message);
    throw error;
  }
};

export const getAlbaranesVentas = async (page, limit) => {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const cabeceraAlbaran = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("LIMIT", sql.Int, limit)
      .query(cQuerysSQL.getAlbaranesVentas);

    const total = await pool.query(cQuerysSQL.getCountAlbaranVenta);

    const totalAlbaranes = total.recordset[0].total;
    return {
      albaranes: cabeceraAlbaran.recordset.map(
        (albaran) => new cAlbaranVenta(albaran),
      ),
      totalItems: totalAlbaranes,
      totalPages: Math.ceil(totalAlbaranes / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getAlbaranesVentas:", error.message);
    throw error;
  }
};

export const getAlbaranVenta = async (serie, numero) => {
  const serieFormateada = serie.trim();

  try {
    const pool = await getConnection();
    const cabeceraAlbaran = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getAlbaranVenta);

    if (cabeceraAlbaran.recordset.length === 0) {
      return null;
    }

    const dbHeader = cabeceraAlbaran.recordset[0];

    const detalleAlbaran = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getDetalleAlbaranVenta);

    if (detalleAlbaran.recordset.length === 0) {
      return null;
    }

    const dbDetail = detalleAlbaran.recordset;

    if (dbDetail.length > 0 && dbDetail[0].ALMACEN) {
      dbHeader.CODALMACEN = dbDetail[0].ALMACEN;
    } else {
      dbHeader.CODALMACEN = "";
    }

    const albaran = new cAlbaranVenta(dbHeader, dbDetail);
    return albaran;
  } catch (error) {
    console.error("Error en getAlbaranVenta:", error.message);
    throw error;
  }
};

export const comprobarSiExisteAlbaran = async (serie, numero) => {
  try {
    const serieFormateada = serie.trim();
    const pool = await getConnection();

    //1. Busco la factura para obtener luego ir a buscar el albaran
    const factura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.Int, numero)
      .query(cQuerysSQL.getFacturaVenta);

    if (factura.recordset.length === 0) {
      return null;
    }
    // 2. Creo la cabecera de la factura para facilitar el manejo de los datos
    const cabeceraFactura = factura.recordset[0];

    // 3. Obtengo la serie y el número de la factura para buscar el albaran
    const serieFactura = cabeceraFactura.NUMSERIE;
    const numeroFactura = cabeceraFactura.NUMFACTURA;

    /* 4. Creo la conexión a la consulta confirmarAlbaran que me trae 
    el número de serie de la factura, el número de la factura, 
    el número de serie del albaran, el número del albaran, 
    el numseriefac de la tabla albventacab que es el mismo número 
    de la factura, el numfac y el campo facturado de albventacab
    que me indica si el albaran ya se facturo (creo que el campo no 
    lo estoy usandod  de todos modos )
    */
    const serieFacturaFormateada = serieFactura.trim();

    const albaran = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFacturaFormateada)
      .input("NUMERO", sql.Int, numeroFactura)
      .query(cQuerysSQL.confirmarAlbaran);

    if (albaran.recordset.length === 0) {
      console.log("No se encontro un albaran para la factura");
      return null;
    }

    /* 5. Facilito el manejo de los datos del albaran para poder 
    buscar la guia
    */

    const albaranDatos = albaran.recordset[0];
    console.log("Albaran Datos: ", albaranDatos);

    const serieAlbaran = albaranDatos.NUMSERIE;
    const numeroAlbaran = albaranDatos.NUMALBARAN;

    /* 6. Busco la guia por la serie y el número que obtuve 
    de la consulta anterior. Tomando en cuenta de que debe de
    ser un albaran lo que estoy buscando
    */
    console.log("Serie Albaran: ", serieAlbaran);
    console.log("Numero Albaran: ", numeroAlbaran);
    const obtenerGuia = await pool
      .request()
      .input("SERIE", sql.VarChar, serieAlbaran.toString())
      .input("NUMERO", sql.Int, numeroAlbaran)
      .query(cQuerysSQL.buscarGuia);

    /* 7. Si el albaran no tiene guia, retorno false 
    ya que entonces me permitiria que la factura cree su 
    propia guia 
    */
    console.log("Guia encontrada: ", obtenerGuia.recordset);

    if (obtenerGuia.recordset.length === 0) {
      console.log("No se encontro una guia para el albaran");
      return { exists: false, guia: null };
    }

    /* 8. Si el albaran tiene guia, retorno true ya que 
    no es necesario que la factura cree su propia guia
    */
    const guia = obtenerGuia.recordset[0];
    console.log("Guia encontrada: ", guia);
    console.log("Guia encontrada: ", guia.RESPUESTASICM);

    return { exists: true, guia: guia.RESPUESTASICM };

    /*Ahora tengo que implementar esto en el método de 
    generarGuia de guiController para que sepa como va a generar
    las guias a partir de ahora*/
  } catch (error) {
    console.error("Error en comprobarSiExisteAlbaran:", error.message);
    throw error;
  }
};
