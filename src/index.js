import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
import facturaRoutes from "./routes/facturaRoutes.js";
import clienteProveedorRoutes from "./routes/clienteProveedorRoutes.js";
import catalogoRoutes from "./routes/catalogoRoutes.js";
import guiaRoutes from "./routes/guiaRoutes.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3020;

app.get("/test", (req, res) => {
  res.send({ mensaje: "Bienvenido a la API de Farmapatria-ICG v1.0.0" });
});

app.use("/api/facturas", facturaRoutes);
app.use("/api/clientesProveedores", clienteProveedorRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/guia", guiaRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Servicio del API corriendo en http://localhost:${port}`);
});
