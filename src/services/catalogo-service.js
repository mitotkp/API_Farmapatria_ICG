import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getConnection, sql } from "../config/db.js";
import { cArticulo } from "../models/articulos.js";
import { cQuerysSQL } from "../querys/querysSQL.js";
import soap from "soap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const WSDL_URL = process.env.WSDL_URL;
const TOKEN = process.env.SCIM_TOKEN;

export const consultarArticuloFarmaPatria = async (referencia) => {
  try {
    const codSeguridad = TOKEN;

    const client = await soap.createClient(WSDL_URL);

    const args = {
      codSeguridad,
      referencia,
    };

    const result = await client.checkproductoAsync(args);

    const respuesta = result[0]?.return || result[0];

    return {
      consultado: referencia,
      respuesta: respuesta,
      exito: true,
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
