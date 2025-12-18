import { Router } from "express";
import { cGuiaController } from "../controllers/guiaController.js";

const router = Router();

router.post("/generar", cGuiaController.generarGuia);

export default router;
