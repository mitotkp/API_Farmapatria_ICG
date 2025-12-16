import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getConnection, sql } from "../config/db.js";
import { cArticulo } from "../models/articulos.js";
import { cQuerysSQL } from "../querys/querysSQL.js";
import soap from "soap";
import { lstat } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SICM_WSDL = process.env.SICM_WSDL || "http://sicm.gob.ve/sicm.php?wsdl";
const SICM_TOKEN = process.env.SICM_TOKEN;

export const consultarArticuloFarmaPatria = async (referencia) => {
  try {
    const codSeguridad = SICM_TOKEN;

    const client = await soap.createClientAsync(SICM_WSDL);

    const args = {
      codSeguridad,
      referencia,
    };

    const result = await client.getproductoAsync(args);

    const respuesta = result[0]?.return || result[0];

    return {
      consultado: referencia,
      respuesta: respuesta,
    };
  } catch (error) {
    console.error("Error consultando producto SICM:", error.message);
    throw error;
  }
};

export const listarArticulos = async (busqueda, page, limit) => {
  const offset = (page - 1) * limit;
  console.log("Esto es lo que llega al servicio: ", busqueda, page, limit);

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

  console.log("Total de articulos: ", total.recordset[0].total);

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
  const result = await pool
    .request()
    .input("CODARTICULO", sql.Int, codArticulo)
    .input("CODIGO_SICM", sql.NVarChar, codigoSICM)
    .input("DESC_GOBIERNO", sql.NVarChar, descGobierno)
    .query(cQuerysSQL.mapearArticulos);
  return result.recordset[0];
};

let estadoSincronizacion = {
  ejecutando: false,
  progreso: 0,
  total: 0,
  ultimoMensaje: "Esperando inicio...",
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

export const sincronizadorArticulos = async () => {
  if (estadoSincronizacion.ejecutando) {
    return {
      iniciado: false,
      mensaje: "Ya se esta ejecutando la sincronizacion",
    };
  }

  estadoSincronizacion.ejecutando = true;
  estadoSincronizacion.progreso = 0;
  estadoSincronizacion.ultimoMensaje = "Iniciando sincronizacion...";

  ejecutarSincronizacion().catch((err) => {
    console.error("Error en el sincronizador: ", err);
    estadoSincronizacion.ejecutando = false;
    estadoSincronizacion.ultimoMensaje = "Error en el sincronizador";
  });

  return {
    iniciado: true,
    mensaje: "Sincronizacion iniciada en segundo plano",
  };
};

const ejecutarSincronizacion = async () => {
  const BATCH_SIZE = 50;
  let terminar = false;

  console.log("Iniciando sincronizacion...");

  while (!terminar) {
    const resultado = await sincronizarArticulos(BATCH_SIZE);

    estadoSincronizacion.progreso += resultado.procesados;
    estadoSincronizacion.ultimoMensaje = `Procesados: ${estadoSincronizacion.progreso}. Último lote: ${resultado.procesados} procesados.`;

    console.log(`Estado: ${estadoSincronizacion.ultimoMensaje}`);

    if (resultado.fin || resultado.procesados === 0) {
      terminar = true;
      estadoSincronizacion.ejecutando = false;
      estadoSincronizacion.ultimoMensaje = "Sincronizacion finalizada";
      console.log("Trabajo terminado");
    } else {
      await timer(3000);
    }
  }
};

export const sincronizarArticulos = async (cantidad) => {
  const pool = await getConnection();

  let reporte = {
    procesados: 0,
    exitosos: 0,
    fallidos: 0,
    detalles: [],
  };

  try {
    const result = await pool
      .request()
      .input("LIMIT", sql.Int, cantidad)
      .query(cQuerysSQL.getArticulosSinVincular);

    const listarArticulos = result.recordset;

    if (listarArticulos.length === 0) {
      return { mensaje: "No hay articulos para sincronizar" };
    }

    console.log("Articulos para sincronizar: ", listarArticulos.length);

    //console.log("Articulos para sincronizar: ", listarArticulos);

    for (const articulo of listarArticulos) {
      const { CODARTICULO, REFERENCIA, DESCRIPCION } = articulo;
      try {
        const resultadoSoap = await consultarArticuloFarmaPatria(REFERENCIA);

        if (resultadoSoap.ok === true) {
          await mapearArticulo(
            CODARTICULO,
            resultadoSoap.respuesta.CODIGO_SICM,
            resultadoSoap.respuesta.DESCRIPCIONSCIM
          );
          reporte.exitosos++;
          reporte.detalles.push({
            articulo: CODARTICULO,
            referencia: REFERENCIA,
            ok: true,
            detalle: resultadoSoap.respuesta,
          });
        } else {
          await mapearArticulo(
            CODARTICULO,
            null,
            "NO ENCONTRADO EN FARMAPATRIA"
          );

          reporte.fallidos++;
          reporte.detalles.push({
            articulo: CODARTICULO,
            referencia: REFERENCIA,
            ok: false,
            detalle: resultadoSoap.respuesta,
          });
        }

        reporte.procesados++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error consultando articulo: ", error);
        reporte.fallidos++;
      }
    }
  } catch (error) {
    console.error("Error sincronizando articulos: ", error);
    return { mensaje: "Error sincronizando articulos", error };
  }

  return reporte;
};

export const obtenerEstadoSincronizacion = () => {
  return estadoSincronizacion;
};
