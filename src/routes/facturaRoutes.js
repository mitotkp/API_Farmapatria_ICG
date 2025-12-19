import { Router } from "express";
import { cFacturaControllers } from "../controllers/facturaControllers.js";

const router = Router();

router.get("/obtenerFacturasVentas", cFacturaControllers.obtenerFacturasVentas);
router.get(
  "/obtenerFacturasCompras",
  cFacturaControllers.obtenerFacturasCompras
);
router.get("/buscarFacturaVenta", cFacturaControllers.buscarFacturaVenta);
router.get("/buscarFacturaCompra", cFacturaControllers.buscarFacturaCompra);

export default router;
