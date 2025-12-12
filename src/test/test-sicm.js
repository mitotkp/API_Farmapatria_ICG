import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import soap from "soap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const wsdl = process.env.SICM_WSDL;

const testSICM = async () => {
  try {
    console.log("Conectando a SICM...");
    const client = await soap.createClientAsync(wsdl);
    console.log("Conectado a SICM");

    const args = { val: "Prueba desde Node.js" };

    console.log("Enviando solicitud a SICM...");
    const result = await client.holasicmAsync(args);

    console.log("Console log: ", JSON.stringify(result[0], null, 2));
  } catch (error) {
    console.error("Error conectando a SICM:", err.message);
    console.log("...");
  }
};

testSICM();
