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
