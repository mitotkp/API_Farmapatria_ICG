import {
  getFacturaVenta,
  getFacturaCompra,
  getFacturasVentas,
  getFacturasCompras,
} from "../services/factura-service.js";

export class cFacturaControllers {
  static obtenerFacturasVentas = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;

    try {
      const facturas = await getFacturasVentas(page, limit);
      return res.status(200).json({
        ok: true,
        facturas: facturas.facturas,
        page,
        limit,
        totalItems: facturas.totalItems,
        totalPages: facturas.totalPages,
      });
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      res.status(500).json({ error: "Error al obtener facturas" });
    }
  };

  static obtenerFacturasCompras = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;

    try {
      const facturas = await getFacturasCompras(page, limit);
      return res.status(200).json({
        ok: true,
        facturas: facturas.facturas,
        page,
        limit,
        totalItems: facturas.totalItems,
        totalPages: facturas.totalPages,
      });
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      res.status(500).json({ error: "Error al obtener facturas" });
    }
  };

  static buscarFacturaVenta = async (req, res) => {
    try {
      const { serie, numero } = req.query;
      console.log("Parametros recibidos: ", req.query);

      if (!serie || !numero) {
        return res.status(400).json({
          ok: false,
          msg: "Faltan parametros",
        });
      }

      const factura = await getFacturaVenta(serie, numero);

      if (!factura) {
        return res.status(404).json({
          ok: false,
          msg: "Factura no encontrada",
        });
      }

      return res.status(200).json({
        ok: true,
        factura,
      });
    } catch (error) {
      console.error("Error al buscar factura:", error);
      res.status(500).json({ error: "Error al buscar factura" });
    }
  };

  static buscarFacturaCompra = async (req, res) => {
    try {
      const { serie, numero } = req.query;
      console.log("Parametros recibidos: ", req.query);

      if (!serie || !numero) {
        return res.status(400).json({
          ok: false,
          msg: "Faltan parametros",
        });
      }

      const factura = await getFacturaCompra(serie, numero);

      if (!factura) {
        return res.status(404).json({
          ok: false,
          msg: "Factura no encontrada",
        });
      }

      return res.status(200).json({
        ok: true,
        factura,
      });
    } catch (error) {
      console.error("Error al buscar factura:", error);
      res.status(500).json({ error: "Error al buscar factura" });
    }
  };
}
