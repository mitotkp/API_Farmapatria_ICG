import { getFacturaVenta } from "../services/factura-service.js";

const SERIE_PRUEBA = "AB1T";
const NUMERO_PRUEBA = 177;

async function probarExtraccion() {
  try {
    console.log(`🔍 Buscando factura ${SERIE_PRUEBA}-${NUMERO_PRUEBA}...`);

    const factura = await getFacturaVenta(SERIE_PRUEBA, NUMERO_PRUEBA);

    if (factura) {
      console.log("✅ ¡Factura extraída con éxito!");
      console.log("------------------------------------------------");
      console.log(
        `Cliente: ${factura.cliente.razonSocial} (RIF: ${factura.cliente.rifCliente})`
      );
      console.log(`Almacén: ${factura.codAlmacen}`);
      console.log(`Fecha:   ${factura.fecha.toLocaleDateString()}`);
      console.log("------------------------------------------------");
      console.log("ÍTEMS:");
      factura.items.forEach((item) => {
        console.log(` - [${item.codArticulo}] ${item.descripcion}`);
        console.log(
          `   Cant: ${item.cantidad} | Vence: ${
            item.vencimiento
              ? item.vencimiento.toISOString().split("T")[0]
              : "N/A"
          }`
        );
      });
      console.log("------------------------------------------------");
    } else {
      console.error(
        "⚠️ La factura no fue encontrada. Verifica la Serie y el Número."
      );
    }
  } catch (error) {
    console.error("❌ Falló la prueba:", error);
  } finally {
    process.exit();
  }
}

probarExtraccion();
