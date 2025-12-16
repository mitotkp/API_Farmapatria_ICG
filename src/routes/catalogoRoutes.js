import { Router } from "express";
import { cCatalogoController } from "../controllers/catalogoController.js";

const router = Router();

router.get("/articulos", cCatalogoController.listarArticulos);
router.get("/consultar", cCatalogoController.consultarFarmaPatria);
router.get("/mapear", cCatalogoController.mapearArticulo);

export default router;
