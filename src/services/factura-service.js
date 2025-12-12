import { getConnection, sql } from "../config/db.js";
import { cFacturaVenta, cFacturaCompra } from "../models/Factura.js";
import { cQuerysSQL } from "../querys/querysSQL.js";

/**
 * @param {string} serie
 * @param {number} numero
 * @returns {Promise<cFacturaVenta|null>}
 */

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
  const numeroString = String(numero).trim();

  console.log("Parametros recibidos: ", serieFormateada, numeroString);

  try {
    const pool = await getConnection();
    const cabeceraFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.VarChar, numeroString)
      .query(cQuerysSQL.getFacturaCompra);

    if (cabeceraFactura.recordset.length === 0) {
      return null;
    }

    const dbHeader = cabeceraFactura.recordset[0];

    const detalleFactura = await pool
      .request()
      .input("SERIE", sql.VarChar, serieFormateada)
      .input("NUMERO", sql.VarChar, numeroString)
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
