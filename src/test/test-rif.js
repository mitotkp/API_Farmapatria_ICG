import soap from "soap";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getConnection } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SICM_WSDL = process.env.SICM_WSDL || "http://sicm.gob.ve/sicm.php?wsdl";
const SICM_TOKEN = process.env.SICM_TOKEN;
console.log("SICM_WSDL:", SICM_WSDL);
console.log("SICM_TOKEN:", SICM_TOKEN);

async function probarRif() {
  try {
    const client = await soap.createClientAsync(SICM_WSDL);

    const RIF_PRUEBA = "J-06312824";

    console.log(`Consultando RIF: ${RIF_PRUEBA}...`);

    const args = {
      cod_seguridad: SICM_TOKEN,
      rif: RIF_PRUEBA,
    };

    const result = await client.check_rifAsync(args);

    const respuesta = result;

    console.log("\nRESPUESTA DEL GOBIERNO:");
    console.dir(respuesta, { depth: null });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

probarRif();
