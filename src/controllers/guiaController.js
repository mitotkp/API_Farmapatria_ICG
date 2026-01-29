import { getConnection, sql } from "../config/db.js";
import {
  getFacturaVenta,
  getAlbaranVenta,
  comprobarSiExisteAlbaran,
} from "../services/factura-service.js";
import {
  inicializarGuia,
  agregarDetalleGuia,
  aprobarGuia,
  anularGuia,
} from "../services/scim-service.js";
import { obtenerClienteFP } from "../services/clientes-proveedores-service.js";
import { validarArticuloFp } from "../services/catalogo-service.js";
import { cQuerysSQL } from "../querys/querysSQL.js";

const registrarGuia = async (
  numGuia,
  serie,
  numFactura,
  cliente,
  estatus,
  link,
  tipoDoc,
) => {
  const pool = await getConnection();
  await pool
    .request()
    .input("GUIA", sql.Int, numGuia)
    .input("SERIE", sql.VarChar, serie)
    .input("NUMERO", sql.VarChar, numFactura)
    .input("CLIENTE", sql.Int, cliente)
    .input("ESTATUS", sql.VarChar, estatus)
    .input("LINK", sql.VarChar, link)
    .input("TIPODOC", sql.VarChar, tipoDoc)
    .query(cQuerysSQL.insertarGuia);
};

const actualizarEstatusGuia = async (numGuia, estatus) => {
  const pool = await getConnection();
  await pool
    .request()
    .input("GUIA", sql.Int, numGuia)
    .input("ESTATUS", sql.VarChar, estatus)
    .query(cQuerysSQL.actualizarEstatusGuia);
};
export class cGuiaController {
  static generarGuia = async (req, res) => {
    let idGuia = null;

    try {
      const { serie, numero, tipoDoc } = req.query;

      console.log("Parametros recibidos: ", req.query);

      if (!serie || !numero || !tipoDoc)
        return res
          .status(400)
          .json({ ok: false, msg: "Faltan datos para generar la guia" });

      const serieM = serie.toUpperCase();

      console.log("Iniciando genereación de guia", serieM, numero, tipoDoc);

      if (tipoDoc === "F") {
        const albaran = await comprobarSiExisteAlbaran(serieM, numero);

        console.log("Albaran", albaran);

        if (albaran.exists === true) {
          return res.status(400).json({
            ok: false,
            msg: "No se puede generar una guia para la factura porque el albaran ya tiene una guia creada",
            guia: albaran.guia,
          });
        } else {
          const factura = await getFacturaVenta(serieM, numero);

          if (!factura)
            return res
              .status(400)
              .json({ ok: false, msg: "Factura no encontrada en ICG" });

          if (factura.items.length === 0)
            return res
              .status(400)
              .json({ ok: false, msg: "Factura no tiene productos" });

          const rifCliente = factura.cliente.rifCliente;
          const codClienteICG = factura.cliente.codCliente;

          console.log(rifCliente);
          console.log(codClienteICG);

          const clienteFP = (await obtenerClienteFP(rifCliente)) || "16360";

          console.log(clienteFP);

          if (!clienteFP) {
            return res
              .status(400)
              .json({ ok: false, msg: "SICM del cliente no encontrado" });
          }

          const productosValidados = [];

          for (const producto of factura.items) {
            const codSicm = await validarArticuloFp(producto.codArticulo);

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
              item.codBarras,
              item.precioBs,
              item.cantidad,
            );
          }

          //await aprobarGuia(idGuia);

          await registrarGuia(
            idGuia,
            serie,
            numero,
            codClienteICG,
            "Generada",
            `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
            "F",
          );

          res.json({
            ok: true,
            msg: "Guia generada exitosamente",
            guia: idGuia,
            link: `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
          });
        }
      } else {
        const albaran = await getAlbaranVenta(serieM, numero);

        if (!albaran)
          return res
            .status(400)
            .json({ ok: false, msg: "Albaran no encontrado" });

        const rifCliente = albaran.cliente.rifCliente;
        const codClienteICG = albaran.cliente.codCliente;

        const clienteFP = (await obtenerClienteFP(rifCliente)) || "16360";

        if (!clienteFP) {
          return res
            .status(400)
            .json({ ok: false, msg: "SICM del cliente no encontrado" });
        }

        const productosValidados = [];

        for (const producto of albaran.items) {
          const codSicm = await validarArticuloFp(producto.codArticulo);

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
            item.codBarras,
            item.precioBs,
            item.cantidad,
          );
        }

        //await aprobarGuia(idGuia);

        await registrarGuia(
          idGuia,
          serie,
          numero,
          codClienteICG,
          "Generada",
          `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
          "A",
        );

        res.json({
          ok: true,
          msg: "Guia generada exitosamente",
          guia: idGuia,
          link: `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
        });
      }
    } catch (error) {
      console.error("Error generando guía:", error);

      if (idGuia) {
        try {
          console.log(`Intentando anular guía incompleta ${idGuia}...`);
          await anularGuia(idGuia);
          await actualizarEstatusGuia(idGuia, "Anulada");
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

  static generarGuiaAlbaran = async (req, res) => {
    let idGuia = null;

    try {
      const { serie, numero } = req.query;

      console.log("Parametros del albaran recibidos: ", req.query);

      if (serie || numero)
        return res
          .status(400)
          .json({ ok: false, msg: "Faltan datos del albaran" });

      const serieM = serie.toUpperCase();

      console.log("Generando guia para el albaran ", serieM, numero);

      const albaran = await getAlbaran(serieM, numero);

      if (!albaran)
        return res
          .status(400)
          .json({ ok: false, msg: "Albaran no encontrado" });

      const rifCliente = albaran.cliente.rifCliente;
      const codClienteICG = albaran.cliente.codCliente;

      const clienteFP = (await obtenerClienteFP(rifCliente)) || "16360";

      if (!clienteFP) {
        return res
          .status(400)
          .json({ ok: false, msg: "SICM del cliente no encontrado" });
      }

      const productosValidados = [];

      for (const producto of albaran.items) {
        const codSicm = await validarArticuloFp(producto.codArticulo);

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
          item.precioBs,
          item.cantidad,
        );
      }

      //await aprobarGuia(idGuia);

      await registrarGuia(
        idGuia,
        serie,
        numero,
        codClienteICG,
        "Generada",
        `http://sicm.gob.ve/g_4cguia.php?id_guia=${idGuia}`,
      );

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
          await actualizarEstatusGuia(idGuia, "Anulada");
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

  static anularGuiaManual = async (req, res) => {
    try {
      const { idGuia } = req.query;

      if (!idGuia) {
        return res
          .status(400)
          .json({ ok: false, msg: "Debe indicar el numero de guia" });
      }

      console.log("Anulando guia: ", idGuia);

      const resultado = await anularGuia(idGuia);

      await actualizarEstatusGuia(idGuia, "Anulada");

      res.json({ ok: true, msg: "Guia anulada exitosamente", resultado });
    } catch (error) {
      console.error("Error anulando guia:", error);
      res
        .status(500)
        .json({ ok: false, msg: "Error anulando guia", error: error.message });
    }
  };
}
