import {
  consultarArticuloFarmaPatria,
  listarArticulos,
  getArtiuloPorCodigo,
  mapearArticulo,
  sincronizarArticulos,
  sincronizadorArticulos,
  obtenerEstadoSincronizacion,
} from "../services/catalogo-service.js";

export class cCatalogoController {
  static listarArticulos = async (req, res) => {
    try {
      let { q, page, limit } = req.query;

      if (!q) q = null;

      const articulos = await listarArticulos(
        q,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        ok: true,
        ...articulos,
      });
    } catch (error) {
      console.error("Error al listar articulos:", error);
      res.status(500).json({ error: "Error al listar articulos" });
    }
  };

  static consultarFarmaPatria = async (req, res) => {
    try {
      const { referencia } = req.query;

      if (!referencia)
        return res
          .status(400)
          .json({ error: "Debe proporcionar una referencia" });

      const info = await consultarArticuloFarmaPatria(referencia);
      res.json({ ok: true, data: info });
    } catch (error) {
      console.error("Error al consultar articulo:", error);
      res.status(500).json({ error: "Error al consultar articulo" });
    }
  };

  static mapearArticulo = async (req, res) => {
    try {
      const { codArticulo, codigoSICM, descGobierno } = req.query;

      if (!codArticulo || !codigoSICM || !descGobierno)
        return res.status(400).json({
          error: "Debe proporcionar un codigo, codigo SICM y desc gobierno",
        });

      const articulo = await mapearArticulo(
        codArticulo,
        codigoSICM,
        descGobierno
      );
      res.json({ ok: true, data: articulo });
    } catch (error) {
      console.error("Error al mapear articulo:", error);
      res.status(500).json({ error: "Error al mapear articulo" });
    }
  };

  static iniciarSincronizacion = async (req, res) => {
    try {
      const resultado = await sincronizadorArticulos();
      res.json({ ok: true, ...resultado });
    } catch (error) {
      console.error("Error al iniciar sincronizacion:", error);
      res.status(500).json({ error: "Error al iniciar sincronizacion" });
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
