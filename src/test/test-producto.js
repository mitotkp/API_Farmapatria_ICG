import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import soap from "soap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const WSDL_URL = process.env.SICM_WSDL;
const WSDL_TOKEN = process.env.SICM_TOKEN;

const codBarrasPrueba = "7591519000948";

const probarProducto = async () => {
  try {
    console.log("Probar producto...");
    const cliente = await soap.createClientAsync(WSDL_URL);

    const args = {
      cod_seguridad: WSDL_TOKEN,
      cod_barras: codBarrasPrueba,
    };

    console.log(
      `Verificando producto con código de barras: ${codBarrasPrueba}`
    );

    const result = await cliente.getproductoAsync(args);

    console.log("Respuesta recibida: ", JSON.stringify(result[0], null, 2));

    if (JSON.stringify(result[0]).includes("error")) {
      console.log("Producto no encontrado");
    } else {
      console.log("Producto encontrado");
    }
  } catch (error) {
    console.log("Error al probar el producto: ", error.message);
  }
};

probarProducto();
