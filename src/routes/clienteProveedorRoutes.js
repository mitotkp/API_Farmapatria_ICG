import { Router } from "express";
import { cClienteProveedorControllers } from "../controllers/clienteProveedorControllers.js";

const router = Router();

router.get("/clientes", cClienteProveedorControllers.clientes);
router.get("/proveedores", cClienteProveedorControllers.proveedores);
router.get("/buscarCliente", cClienteProveedorControllers.buscarCliente);
router.get("/buscarProveedor", cClienteProveedorControllers.buscarProveedor);
router.post(
  "/sincronizarClientes",
  cClienteProveedorControllers.sincronizarClientes
);
router.get(
  "/estadoSincronizacionClientes",
  cClienteProveedorControllers.obtenerEstadoSincronizacionClientes
);
export default router;
