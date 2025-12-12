import { Router } from "express";
import { cClienteProveedorControllers } from "../controllers/clienteProveedorControllers.js";

const router = Router();

router.get("/clientes", cClienteProveedorControllers.clientes);
router.get("/proveedores", cClienteProveedorControllers.proveedores);
router.get("/buscarCliente", cClienteProveedorControllers.buscarCliente);
router.get("/buscarProveedor", cClienteProveedorControllers.buscarProveedor);

export default router;
