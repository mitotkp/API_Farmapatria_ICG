import { getConnection, sql } from "../config/db.js";
import { cCliente, cProveedor } from "../models/clientes-proveedores.js";
import { cQuerysSQL } from "../querys/querysSQL.js";

/**
 * @param {number} codCliente
 * @returns {Promise<cCliente|null>}
 */

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

    return {
      clientes: clientes.recordset.map((cliente) => new cCliente(cliente)),
      totalItems: clientes.recordset.length,
      totalPages: Math.ceil(clientes.recordset.length / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error("Error en getClientes:", error.message);
    throw error;
  }
};

export const getProveedores = async () => {
  try {
    const pool = await getConnection();
    const proveedores = await pool.request().query(cQuerysSQL.getProveedores);
    return proveedores.recordset.map((proveedor) => new cProveedor(proveedor));
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
