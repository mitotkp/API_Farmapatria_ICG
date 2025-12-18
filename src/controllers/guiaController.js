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
import { obtenerClienteFP } from "../services/clientes-proveedores-service.js";
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
          .json({ ok: false, msg: "Factura no encontrada en ICG" });

      const cabecera = factura[0];
      const productos = await getDetalleFacturaVenta(serie, numero);

      const clienteFP = await obtenerClienteFP(cabecera.NIF20);

      if (!clienteFP || clienteFP.length === 0)
        return res
          .status(400)
          .json({ ok: false, msg: "Cliente no encontrado en ICG" });

      const productosValidados = [];

      for (const producto of productos) {
        const codSicm = await validarArticuloFp(producto.CODARTICULO);

        if (codSicm) {
          productosValidados.push({
            ...producto,
            sicm: codSicm,
          });
        }
      }

      console.log(productosValidados);

      const docRef = `${serie}-${numero}`;
      idGuia = await inicializarGuia(clienteFP, 1, docRef, null);

      console.log(`Guia inicializada: ${idGuia}`);

      for (const item of productosValidados) {
        await agregarDetalleGuia(
          idGuia,
          item.sicm,
          null,
          item.PRECIO,
          item.CANTIDAD
        );
      }

      await aprobarGuia(idGuia);

      await registrarGuia(idGuia, serie, numero, clienteFP, "Aprobada");

      res.json({
        ok: true,
        msg: "Guia generada exitosamente",
        guia: idGuia,
        link: `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
      });
    } catch (error) {
      console.error("Error generando guía:", error);

      if (idGuia) {
        try {
          console.log(`Intentando anular guía incompleta ${idGuia}...`);
          await anularGuia(idGuia);
        } catch (e) {
          console.error("Error anulando guía:", e.message);
        }
      }

      res.status(500).json({
        ok: false,
        msg: "Error generando guía",
        error: error.message,
      });
    }
  };
}
