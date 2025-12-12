import {
  getFacturaVenta,
  getFacturaCompra,
} from "../services/factura-service.js";

export class cFacturaControllers {
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
