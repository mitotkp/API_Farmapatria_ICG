import "dotenv/config"; // Carga las variables de entorno (.env)
import {
  verificarRif,
  inicializarGuia,
  agregarDetalleGuia,
  aprobarGuia,
  anularGuia,
} from "../services/scim-service.js"; // ⚠️ Verifica si tu archivo se llama 'scim-service.js' o 'sicm-service.js'

async function testCicloCompleto() {
  console.log("🚀 Iniciando prueba de ciclo de vida de Guía SICM...");

  // DATOS DE PRUEBA (Ajusta esto con datos reales de tu base de datos si quieres)
  const RIF_DESTINO = "J506312824"; // Pon un RIF válido de una farmacia cliente
  const CODIGO_SICM_PRODUCTO = "7591519000948"; // Un código que sepas que existe (ej: Atamel)
  const NUMERO_FACTURA_PRUEBA = "PRUEBA-" + Math.floor(Math.random() * 1000);

  let idGuia = null;

  try {
    // PASO 1: Verificar RIF
    console.log("\n1️⃣ Verificando RIF destino...");
    const datosRif = await verificarRif(RIF_DESTINO);
    console.log(
      "   ✅ RIF Verificado:",
      datosRif ? "Existe" : "No existe (pero continuamos)"
    );

    // PASO 2: Inicializar Guía
    console.log(
      `\n2️⃣ Creando cabecera de guía para factura ${NUMERO_FACTURA_PRUEBA}...`
    );
    // Parametros: (codSicmDestino, bultos, numFactura, codAlmacen)
    // Nota: Si no tienes el Código SICM del destino, usa el RIF o busca uno en tu tabla de clientes
    // Para esta prueba, asumiremos que Farmapatria acepta el RIF o un código dummy si es entorno de pruebas
    // Si falla aquí, necesitas un CÓDIGO SICM válido de una farmacia real (ej: '16360' del log anterior)
    const codigoSicmDestinoReal = "16360"; // Usamos el de Farmaexito que vimos en tu log anterior

    idGuia = await inicializarGuia(
      codigoSicmDestinoReal,
      1,
      NUMERO_FACTURA_PRUEBA,
      null
    );
    console.log(idGuia);

    console.log("   ✅ Guía Creada. ID:", idGuia);

    // PASO 3: Agregar Detalle
    console.log("\n3️⃣ Agregando producto...");
    const resultadoDetalle = await agregarDetalleGuia(
      idGuia,
      CODIGO_SICM_PRODUCTO,
      "LOTE-TEST",
      100.0, // Precio
      5 // Cantidad
    );
    console.log("   ✅ Producto agregado. Resultado:", resultadoDetalle);

    // PASO 4: Anular (Para limpiar)
    // Cambia esto a aprobarGuia(idGuia) si quieres generar el PDF real
    console.log("\n4️⃣ Anulando guía de prueba...");
    const resultadoAnulacion = await anularGuia(idGuia);
    console.log("   ✅ Guía Anulada:", resultadoAnulacion);

    console.log(
      "\n🎉 PRUEBA EXITOSA: El servicio SICM responde correctamente."
    );
  } catch (error) {
    console.error("\n❌ LA PRUEBA FALLÓ:", error.message);
    if (idGuia) {
      console.log("   ⚠️ Intentando anular la guía huérfana...");
      await anularGuia(idGuia).catch((e) =>
        console.log("   No se pudo anular:", e.message)
      );
    }
  }
}

testCicloCompleto();
