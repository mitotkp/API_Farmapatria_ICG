import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import soap from "soap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const WSDL_URL = process.env.SICM_WSDL;
const WSDL_TOKEN = process.env.SICM_TOKEN;
const rifEmpresa = "J501590192";

const probrarToken = async () => {
  try {
    console.log("Probar token...");
    const cliente = await soap.createClientAsync(WSDL_URL);

    const args = {
      cod_seguridad: WSDL_TOKEN,
      rif: rifEmpresa,
    };

    console.log(`Verificando rif: ${rifEmpresa}`);

    const result = await cliente.check_rifAsync(args);

    console.log("Respuesta recibida: ", JSON.stringify(result[0], null, 2));

    if (JSON.stringify(result[0]).includes("error")) {
      console.log("Token inválido");
    } else {
      console.log("El token es válido");
    }
  } catch (error) {
    console.log("Error al probar el token: ", error.message);
  }
};

probrarToken();
