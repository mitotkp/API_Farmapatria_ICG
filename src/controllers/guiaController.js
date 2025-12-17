import { getConnection } from "../config/db.js";
import {
  getFacturaVenta,
  getDetalleFacturaVenta,
} from "../services/factura-service.js";
import {
  inicializarGuia,
  agregarDetalleGuia,
  aprobarGuia,
  anularGuia,
} from "../services/scim-service.js";
import { cQuerysSQL } from "../querys/querysSQL.js";

const registrarGuia = async (numGuia, serie, numFactura, cliente, estatus) => {
  const pool = await getConnection();
  await pool
    .request()
    .input("GUIA", sql.Int, numGuia)
    .input("SERIE", sql.VarChar, serie)
    .input("NUMERO", sql.VarChar, numFactura)
    .input("CLIENTE", sql.Int, cliente)
    .input("ESTATUS", sql.VarChar, estatus)
    .query(cQuerysSQL.insertarGuia);
};

export class cGuiaController {
  static generarGuia = async (req, res) => {
    let idGuia = null;
    try {
      const { serie, numero } = req.body;
      if (!serie || !numero)
        return res
          .status(400)
          .json({ ok: false, msg: "Faltan datos de la factura" });

      console.log("Iniciando genereación de guia");

      const factura = await getFacturaVenta(serie, numero);

      if (!factura || factura.length === 0)
        return res
          .status(400)
          .json({ ok: false, msg: "Factura no encontrada" });

      const cabecera = factura[0];
      const productos = await getDetalleFacturaVenta(serie, numero);
    } catch (error) {}
  };
}
