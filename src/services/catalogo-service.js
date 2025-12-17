import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getConnection, sql } from "../config/db.js";
import { cQuerysSQL } from "../querys/querysSQL.js";
import soap from "soap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SICM_WSDL = process.env.SICM_WSDL || "http://sicm.gob.ve/sicm.php?wsdl";
const SICM_TOKEN = process.env.SICM_TOKEN;

let estadoSincronizacion = {
  ejecutando: false,
  progreso: 0,
  total: 0,
  ultimoMensaje: "Esperando inicio...",
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

export const consultarArticuloFarmaPatria = async (referencia) => {
  try {
    const codSeguridad = SICM_TOKEN;
    const client = await soap.createClientAsync(SICM_WSDL, {
      wsdl_options: { timeout: 10000 },
    });

    const args = { cod_seguridad: codSeguridad, cod_barras: referencia };

    const result = await client.getproductoAsync(args);

    let nombreProducto = null;
    const rawData = result[0]?.return || result[0];

    if (rawData && typeof rawData === "object" && rawData.$value) {
      nombreProducto = rawData.$value;
    } else if (typeof rawData === "string") {
      nombreProducto = rawData;
    } else if (rawData && rawData.result) {
      if (typeof rawData.result === "object" && rawData.result.$value) {
        nombreProducto = rawData.result.$value;
      } else {
        nombreProducto = rawData.result;
      }
    }

    const existe =
      nombreProducto &&
      nombreProducto.length > 2 &&
      !nombreProducto.includes("Error");

    return {
      ok: existe,
      consultado: referencia,
      respuesta: {
        CODIGO_SICM: referencia,
        DESCRIPCIONSCIM: nombreProducto || "Sin Descripción",
      },
    };
  } catch (error) {
    console.error(`Error consultando ${referencia}:`, error.message);
    return { ok: false, consultado: referencia, error: error.message };
  }
};

export const sincronizadorArticulos = async () => {
  if (estadoSincronizacion.ejecutando) {
    return {
      iniciado: false,
      mensaje: "Ya se está ejecutando la sincronización",
    };
  }

  estadoSincronizacion.ejecutando = true;
  estadoSincronizacion.progreso = 0;
  estadoSincronizacion.ultimoMensaje = "Iniciando sincronización...";

  ejecutarSincronizacion().catch((err) => {
    console.error("Error FATAL en el sincronizador:", err);
    estadoSincronizacion.ejecutando = false;
    estadoSincronizacion.ultimoMensaje = "Error fatal: " + err.message;
  });

  return {
    iniciado: true,
    mensaje: "Sincronización iniciada en segundo plano",
  };
};

const ejecutarSincronizacion = async () => {
  const BATCH_SIZE = 50;
  let terminar = false;

  console.log("Iniciando bucle...");

  while (!terminar && estadoSincronizacion.ejecutando) {
    try {
      const resultado = await sincronizarArticulos(BATCH_SIZE);

      estadoSincronizacion.progreso += resultado.procesados || 0;
      estadoSincronizacion.ultimoMensaje = `Total procesados: ${estadoSincronizacion.progreso}. Último lote: ${resultado.exitosos}  / ${resultado.fallidos}.`;

      console.log(`Lote terminado: ${estadoSincronizacion.ultimoMensaje}`);

      if (resultado.fin || resultado.procesados === 0) {
        terminar = true;
        estadoSincronizacion.ejecutando = false;
        estadoSincronizacion.ultimoMensaje =
          "Sincronización finalizada correctamente.";
        console.log("WORKER: Trabajo terminado.");
      } else {
        await timer(2000);
      }
    } catch (error) {
      console.error("Error en bucle principal:", error);
      terminar = true;
      estadoSincronizacion.ejecutando = false;
      estadoSincronizacion.ultimoMensaje =
        "Detenido por error: " + error.message;
    }
  }
};

export const sincronizarArticulos = async (cantidad) => {
  let reporte = { procesados: 0, exitosos: 0, fallidos: 0, fin: false };
  let pool;

  try {
    pool = await getConnection();

    const result = await pool
      .request()
      .input("LIMIT", sql.Int, cantidad)
      .query(cQuerysSQL.getArticulosSinVincular);

    const lista = result.recordset;

    if (!lista || lista.length === 0) {
      return {
        ...reporte,
        fin: true,
        mensaje: "No hay más artículos pendientes",
      };
    }

    for (const articulo of lista) {
      const { CODARTICULO, REFERENCIA } = articulo;

      console.log(`Procesando artículo ${CODARTICULO}: ${REFERENCIA}`);

      try {
        const resultadoSoap = await consultarArticuloFarmaPatria(REFERENCIA);

        console.log(resultadoSoap);

        if (resultadoSoap.ok) {
          await mapearArticulo(
            CODARTICULO,
            resultadoSoap.respuesta.CODIGO_SICM,
            resultadoSoap.respuesta.DESCRIPCIONSCIM
          );
          reporte.exitosos++;
        } else if (resultadoSoap.error) {
          console.warn(`Error de red en ${REFERENCIA}: ${resultadoSoap.error}`);
        } else {
          await mapearArticulo(
            CODARTICULO,
            null,
            "NO ENCONTRADO EN FARMAPATRIA"
          );
          reporte.fallidos++;
        }
      } catch (errItem) {
        console.error(`Error procesando item ${CODARTICULO}:`, errItem);
        reporte.fallidos++;
      }

      reporte.procesados++;
      await timer(100);
    }
  } catch (error) {
    console.error("Error en sincronizarArticulos (Batch):", error);
    return { ...reporte, fin: true, error: error.message };
  }

  return reporte;
};

export const listarArticulos = async (busqueda, page, limit) => {
  const offset = (page - 1) * limit;
  if (!busqueda) busqueda = null;
  if (!page) page = 1;
  if (!limit) limit = 30;

  const pool = await getConnection();

  const result = await pool
    .request()
    .input("BUSQUEDA", sql.NVarChar, busqueda)
    .input("OFFSET", sql.Int, offset)
    .input("LIMIT", sql.Int, limit)
    .query(cQuerysSQL.getArticulos);

  const total = await pool
    .request()
    .input("BUSQUEDA", sql.NVarChar, busqueda)
    .query(cQuerysSQL.contarArticulos);

  return {
    data: result.recordset,
    totalItems: total.recordset[0].total,
    totalPages: Math.ceil(total.recordset[0].total / limit),
    currentPage: page,
    limit,
  };
};

export const getArtiuloPorCodigo = async (codArticulo) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("CODARTICULO", sql.Int, codArticulo)
    .query(cQuerysSQL.getArticuloPorCodigo);
  return result.recordset[0];
};

export const mapearArticulo = async (codArticulo, codigoSICM, descGobierno) => {
  const pool = await getConnection();
  await pool
    .request()
    .input("CODARTICULO", sql.Int, codArticulo)
    .input("CODIGO_SICM", sql.NVarChar, codigoSICM)
    .input("DESC_GOBIERNO", sql.NVarChar, descGobierno)
    .query(cQuerysSQL.mapearArticulos);
  return true;
};

export const obtenerEstadoSincronizacion = () => {
  return estadoSincronizacion;
};
