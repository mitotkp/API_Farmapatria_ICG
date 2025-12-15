import soap from "soap";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getConnection } from "../config/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const WSDL_URL = process.env.WSDL_URL;
const TOKEN = process.env.SCIM_TOKEN;

export const verificarRif = async (rif) => {
  try {
    const codSeguridad = TOKEN;

    const client = new soap.Client(WSDL_URL);

    const args = {
      codSeguridad,
      rif,
    };

    const result = await client.checkRif(args);

    return result[0];
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
  } catch (error) {}
};
