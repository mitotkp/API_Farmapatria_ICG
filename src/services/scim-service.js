import soap from "soap";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
//import { getConnection } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SICM_WSDL = process.env.SICM_WSDL || "http://sicm.gob.ve/sicm.php?wsdl";
const SICM_TOKEN = process.env.SICM_TOKEN;

const extraerRespuesta = (respuesta) => {
  const data = respuesta[0]?.return || respuesta[0];
  if (data && data.respuesta && data.resultado.$value)
    return data.resultado.$value;
  if (data && data.respuesta && data.resultado) return data.resultado;

  return data;
};

export const verificarRif = async (rif) => {
  try {
    if (!rif) return { error: "El RIF es obligatorio" };

    const formatRif = rif.toString().toUpperCase().replace(/-/g, "");
    const client = await soap.createClientAsync(SICM_WSDL, {
      wsdl_options: { timeout: 60000 },
      timeout: 60000,
    });

    //console.log("formatRif", formatRif);

    const args = {
      cod_seguridad: SICM_TOKEN,
      rif: formatRif,
    };

    const result = await client.check_rifAsync(args);
    const xmlRespuesta = extraerRespuesta(result);

    let xmlString = "";
    if (typeof xmlRespuesta === "string") {
      xmlString = xmlRespuesta;
    } else if (xmlRespuesta && typeof xmlRespuesta === "object") {
      xmlString = JSON.stringify(xmlRespuesta);
    } else {
      xmlString = JSON.stringify(xmlRespuesta);
    }

    let codigo = null;
    let nombre = null;

    //console.log("xmlRespuesta", xmlRespuesta);

    const matchCodigo = xmlString.match(/<cod_sicm>(\d+)<\/cod_sicm>/);
    const matchNombre = xmlString.match(/<razon>([^<]+)<\/razon>/);

    if (matchCodigo) {
      codigo = matchCodigo[1];
    }

    if (matchNombre) {
      nombre = matchNombre[1];
    }

    if (codigo) {
      return {
        ok: true,
        cod_sicm: codigo,
        nombre: nombre,
        rifConsultado: formatRif,
      };
    }

    return {
      ok: false,
      error: "RIF no encontrado",
    };
  } catch (error) {
    console.error("Error al verificar el RIF:", error);
    throw error;
  }
};

export const inicializarGuia = async (
  codSicmDestino,
  bultos,
  numFactura,
  codAlmacen
) => {
  try {
    const client = await soap.createClientAsync(SICM_WSDL);
    const args = {
      cod_seguridad: SICM_TOKEN,
      sicm_destino: codSicmDestino,
      bultos: bultos || 1,
      documentos: numFactura,
    };

    console.log("Inicializando guía con los siguientes datos:", args);

    const result = await client.inicializar_guiaAsync(args);
    let idGuia = null;

    const rawData = result[0]?.return || result[0];

    if (rawData && typeof rawData === "object" && rawData.$value) {
      idGuia = rawData.$value;
    } else if (typeof rawData === "string") {
      idGuia = rawData;
    } else if (rawData && rawData.result) {
      if (typeof rawData.result === "object" && rawData.result.$value) {
        idGuia = rawData.result.$value;
      } else {
        idGuia = rawData.result;
      }
    }

    console.log("idguia:", idGuia);

    if (!idGuia || idGuia <= 0 || isNaN(idGuia)) {
      throw new Error(`Error SICM al crear guía. Respuesta: ${idGuia}`);
    }

    return idGuia;
  } catch (error) {
    console.error("Error al inicializar la guía:", error);
    throw error;
  }
};

export const agregarDetalleGuia = async (
  idGuia,
  codSicmProducto,
  lote,
  precio,
  cantidad
) => {
  try {
    const client = await soap.createClientAsync(SICM_WSDL);

    const args = {
      cod_seguridad: SICM_TOKEN,
      cod_guia: idGuia,
      cod_producto: codSicmProducto,
      lote: lote || "GENERICO",
      precio: precio,
      cantidad: cantidad,
    };

    const result = await client.guia_detalleAsync(args);

    const respuesta = result[0]?.return || result[0];

    return respuesta;
  } catch (error) {
    console.error("Error al agregar detalle de la guía:", error);
    throw error;
  }
};

export const aprobarGuia = async (idGuia) => {
  try {
    const client = await soap.createClientAsync(SICM_WSDL);

    const args = {
      cod_seguridad: SICM_TOKEN,
      cod_guia: idGuia,
    };

    console.log(`Aprobando guía ${idGuia}...`);

    const result = await client.guia_validarAsync(args);

    return result[0]?.return || result[0];
  } catch (error) {
    console.error("Error aprobando guía:", error.message);
    throw error;
  }
};

export const anularGuia = async (idGuia) => {
  try {
    const client = await soap.createClientAsync(SICM_WSDL);

    const args = {
      cod_seguridad: SICM_TOKEN,
      cod_guia: idGuia,
    };

    console.log(`Anulando guía ${idGuia}...`);

    const result = await client.guia_anularAsync(args);

    return result[0]?.return || result[0];
  } catch (error) {
    console.error("Error anulando guía:", error.message);
    throw error;
  }
};
