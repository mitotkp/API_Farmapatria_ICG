import {
  getCliente,
  getClientes,
  getProveedor,
  getProveedores,
} from "../services/clientes-proveedores-service.js";

export class cClienteProveedorControllers {
  static clientes = async (req, res) => {
    console.log(req.query.page);
    console.log(req.query.limit);

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    console.log(page, limit);

    try {
      const clientes = await getClientes(page, limit);
      res.status(200).json({
        ok: true,
        clientes,
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
      const proveedores = await getProveedores();
      res.json(proveedores);
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
}
