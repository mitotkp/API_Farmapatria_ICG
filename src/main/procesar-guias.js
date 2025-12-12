import path from "path";
import { fileURLToPath } from "url";
import { obtenerFactura } from "../services/icg-service.js";
import {
  buscarEnCatalogo,
  cargarCatalogo,
} from "../services/catalogo-service.js";
import soap from "soap";
import dotenv from "dotenv";
import sql from "mssql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const WSDL_URL = process.env.SICM_WSDL;
const WSDL_TOKEN = process.env.SICM_TOKEN;

const procesarCsv = async (idFactura) => {
  await cargarCatalogo();
  const factura = await obtenerFactura(idFactura);

  console.log("Factura: ", factura);

  for (const item of factura.Items) {
    let codigoFinal = null;

    console.log("Analizando:", item.Descripcion);

    if (item.CodBarras && item.CodBarras.length > 5) {
      console.log("Tiene código de barras, intentando validar con Gobierno...");
      const cliente = await soap.createClientAsync(WSDL_URL);
      const args = {
        cod_seguridad: WSDL_TOKEN,
        cod_barras: item.CodBarras,
      };
      const result = await cliente.getproductoAsync(args);
      console.log("Respuesta recibida: ", JSON.stringify(result[0], null, 2));
      if (JSON.stringify(result[0]).includes("error")) {
        console.log("Producto no encontrado");
      } else {
        console.log("Producto encontrado");
      }
    }

    if (!codigoFinal) {
      console.log("Buscando en catálogo de excel...");
      const coincidencias = buscarEnCatalogo(item.Descripcion);
      console.log("Coincidencias encontradas: ", coincidencias.length);

      if (coincidencias.length > 0) {
        console.log("Coincidencia encontrada: ", coincidencias[0]);
        const mejorCoincidencia = coincidencias[0];
        console.log("Encontrado en excel:");
        console.log(`ICG: "${item.Descripcion}"`);
        console.log(
          `      FP:  "${mejorCoincidencia.nombre}" (SICM: ${mejorCoincidencia.codigoScim})`
        );
        codigoFinal = mejorCoincidencia.codigoScim;
      } else {
        console.warn("No se encontro coincidencia en el catalogo de excel");
      }
    }
  }
};

procesarCsv(101);
