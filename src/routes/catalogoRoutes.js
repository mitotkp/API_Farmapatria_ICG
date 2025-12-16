import { Router } from "express";
import { cCatalogoController } from "../controllers/catalogoController.js";

const router = Router();

router.get("/articulos", cCatalogoController.listarArticulos);
router.get("/consultar", cCatalogoController.consultarFarmaPatria);
router.get("/mapear", cCatalogoController.mapearArticulo);
router.post("/sincronizar", cCatalogoController.iniciarSincronizacion);
router.get("/estado", cCatalogoController.obtenerEstadoSincronizacion);

export default router;
