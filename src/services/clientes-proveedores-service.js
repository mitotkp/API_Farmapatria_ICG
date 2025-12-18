import { getConnection, sql } from "../config/db.js";
import { cCliente, cProveedor } from "../models/clientes-proveedores.js";
import { cQuerysSQL } from "../querys/querysSQL.js";
import { verificarRif } from "./scim-service.js";

/**
 * @param {number} codCliente
 * @returns {Promise<cCliente|null>}
 */

let estadoSincronizacion = {
  ejecutando: false,
  progreso: 0,
  total: 0,
  ultimoMensaje: "Esperando inicio...",
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

const mapearCliente = async (codCliente, rif, scim, nombreCliente, estatus) => {
  const pool = await getConnection();
  await pool
    .request()
    .input("CODIGO", sql.Int, codCliente)
    .input("RIF", sql.VarChar, rif)
    .input("SICM", sql.VarChar, scim)
    .input("NOMBRE", sql.VarChar, nombreCliente)
    .input("ESTATUS", sql.VarChar, estatus)
    .query(cQuerysSQL.insertarMapeoCliente);
  return true;
};

export const sincronizadorClientes = async () => {
  if (estadoSincronizacion.ejecutando) {
    return {
      iniciado: false,
      mensaje: "Ya se está ejecutando la sincronización",
    };
  }

  estadoSincronizacion.ejecutando = true;
  estadoSincronizacion.progreso = 0;
  estadoSincronizacion.ultimoMensaje = "Inicianco sincronización...";

  ejecutarSincronizacion().catch((error) => {
    console.error("Error en sincronización:", error.message);
    estadoSincronizacion.ejecutando = false;
    estadoSincronizacion.ultimoMensaje =
      "Error en sincronización: " + error.message;
  });

  return {
    iniciado: true,
    mensaje: "Sincronización iniciada en segundo plano",
  };
};

const ejecutarSincronizacion = async () => {
  const BATCH_SIZE = 50;
  let terminar = false;

  console.log("Iniciando bucle...");

  while (!terminar && estadoSincronizacion.ejecutando) {
    try {
      const resultado = await sincronizarClientes(BATCH_SIZE);

      estadoSincronizacion.progreso += resultado.procesados || 0;
      estadoSincronizacion.ultimoMensaje = `Total procesados: ${estadoSincronizacion.progreso}. Último lote: ${resultado.exitosos} / ${resultado.fallidos}.`;

      console.log(`Lote terminado: ${estadoSincronizacion.ultimoMensaje}`);

      if (resultado.fin || resultado.procesados === 0) {
        terminar = true;
        estadoSincronizacion.ejecutando = false;
        estadoSincronizacion.ultimoMensaje =
          "Sincronización finalizada correctamente.";
        console.log("Trabajo terminado.");
      } else {
        await timer(2000);
      }
    } catch (error) {
      console.error("Error en bucle principal:", error);
      terminar = true;
      estadoSincronizacion.ejecutando = false;
      estadoSincronizacion.ultimoMensaje =
        "Error en sincronización: " + error.message;
    }
  }
};

export const sincronizarClientes = async (cantidad) => {
  let reporte = {
    procesados: 0,
    exitosos: 0,
    fallidos: 0,
    fin: false,
  };

  let pool;

  try {
    pool = await getConnection();

    const clientes = await pool
      .request()
      .input("LIMIT", sql.Int, cantidad)
      .query(cQuerysSQL.getClientesSinMapear);

    const lista = clientes.recordset;

    if (!lista || lista.length === 0) {
      return {
        ...reporte,
        fin: true,
        mensaje: "No hay clientes para sincronizar",
      };
    }

    for (const cliente of lista) {
      const { CODCLIENTE, FORMATRIF, NOMBRECLIENTE } = cliente;

      console.log(`Procesando cliente: ${CODCLIENTE} - ${NOMBRECLIENTE}`);
      console.log(`RIF: ${FORMATRIF}`);

      try {
        const clienteICG = await getCliente(CODCLIENTE);
        const resultadoSoap = await verificarRif(FORMATRIF);

        if (!clienteICG || clienteICG.length === 0) {
          return {
            ...reporte,
            fin: true,
            mensaje: "No hay más clientes para sincronizar",
          };
        }

        //console.log(resultadoSoap.nombre);
        //console.log(clienteICG);
        //console.log("Propiedad: ", clienteICG[0].razonSocial);

        let nombreCliente = resultadoSoap.nombre.trim() || "Sin nombre";
        let sicm = resultadoSoap.cod_sicm || "Sin sicm";
        let rif = resultadoSoap.rifConsultado.trim() || "Sin rif";

        if (resultadoSoap.ok && clienteICG.length !== 0) {
          await mapearCliente(
            clienteICG[0].codCliente,
            rif,
            sicm,
            nombreCliente,
            "ENCONTRADO "
          );
          reporte.exitosos++;
        } else {
          await mapearCliente(
            clienteICG[0].codCliente,
            rif,
            sicm,
            nombreCliente,
            "NO ENCONTRADO"
          );
          reporte.fallidos++;
        }
      } catch (error) {
        console.error(
          `Error al procesar cliente ${CODCLIENTE}: ${error.message}`
        );
        reporte.fallidos++;
      }

      reporte.procesados++;
      await timer(100);
    }
  } catch (error) {
    console.error("Error en sincronizarClientes:", error.message);
    return { ...reporte, fin: true, error: error.message };
  }

  return reporte;
};

export const obtenerEstadoSincronizacion = () => {
  return estadoSincronizacion;
};

export const getCliente = async (codCliente) => {
  try {
    const pool = await getConnection();
    const clientes = await pool
      .request()
      .input("CODCLIENTE", sql.Int, codCliente)
      .query(cQuerysSQL.getCliente);
    return clientes.recordset.map((cliente) => new cCliente(cliente));
  } catch (error) {
    console.error("Error en getCliente:", error.message);
    throw error;
  }
};

export const getClientes = async (page, limit) => {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const clientes = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("LIMIT", sql.Int, limit)
      .query(cQuerysSQL.getClientes);

    const totalClientes = await pool
      .request()
      .query(cQuerysSQL.getCountClientes);
    const totalRecords = totalClientes.recordset[0].total;

    return {
      clientes: clientes.recordset.map((cliente) => new cCliente(cliente)),
      totalItems: totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getClientes:", error.message);
    throw error;
  }
};

export const getProveedores = async (page, limit) => {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const proveedores = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("LIMIT", sql.Int, limit)
      .query(cQuerysSQL.getProveedores);

    const totalProveedores = await pool
      .request()
      .query(cQuerysSQL.getCountProveedores);
    const totalRecords = totalProveedores.recordset[0].total;

    return {
      proveedores: proveedores.recordset.map(
        (proveedor) => new cProveedor(proveedor)
      ),
      totalItems: totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getProveedores:", error.message);
    throw error;
  }
};

export const getProveedor = async (codProveedor) => {
  try {
    const pool = await getConnection();
    const proveedores = await pool
      .request()
      .input("CODPROVEEDOR", sql.Int, codProveedor)
      .query(cQuerysSQL.getProveedor);
    return proveedores.recordset.map((proveedor) => new cProveedor(proveedor));
  } catch (error) {
    console.error("Error en getProveedores:", error.message);
    throw error;
  }
};
