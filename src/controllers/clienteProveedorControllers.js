import {
  getCliente,
  getClientes,
  getProveedor,
  getProveedores,
  sincronizador,
  sincronizarClientes,
  sincronizarProveedores,
  obtenerEstadoSincronizacion,
} from "../services/clientes-proveedores-service.js";

export class cClienteProveedorControllers {
  static clientes = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;

    try {
      const clientes = await getClientes(page, limit);
      res.status(200).json({
        ok: true,
        clientes: clientes.clientes,
        page,
        limit,
        totalItems: clientes.totalItems,
        totalPages: clientes.totalPages,
      });
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  };

  static buscarCliente = async (req, res) => {
    try {
      const { codCliente } = req.query;
      const cliente = await getCliente(codCliente);
      res.json(cliente);
    } catch (error) {
      console.error("Error al buscar cliente:", error);
      res.status(500).json({ error: "Error al buscar cliente" });
    }
  };

  static proveedores = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 40;

      const proveedores = await getProveedores(page, limit);
      res.status(200).json({
        ok: true,
        proveedores: proveedores.proveedores,
        page,
        limit,
        totalItems: proveedores.totalItems,
        totalPages: proveedores.totalPages,
      });
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  };

  static buscarProveedor = async (req, res) => {
    try {
      const { codProveedor } = req.query;
      const proveedor = await getProveedor(codProveedor);
      res.json(proveedor);
    } catch (error) {
      console.error("Error al buscar proveedor:", error);
      res.status(500).json({ error: "Error al buscar proveedor" });
    }
  };

  static sincronizarClientes = async (req, res) => {
    try {
      const resultado = await sincronizador("clientes");
      res.json({ ok: true, ...resultado });
    } catch (error) {
      console.error("Error al sincronizar clientes:", error);
      res.status(500).json({ error: "Error al sincronizar clientes" });
    }
  };

  static sincronizarProveedores = async (req, res) => {
    try {
      const resultado = await sincronizador("proveedores");
      res.json({ ok: true, ...resultado });
    } catch (error) {
      console.error("Error al sincronizar proveedores:", error);
      res.status(500).json({ error: "Error al sincronizar proveedores" });
    }
  };

  static obtenerEstadoSincronizacion = async (req, res) => {
    try {
      const estado = obtenerEstadoSincronizacion();
      res.json({ ok: true, ...estado });
    } catch (error) {
      console.error("Error al obtener estado de sincronizacion:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estado de sincronizacion" });
    }
  };
}
