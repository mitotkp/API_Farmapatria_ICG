import express from "express";
import cors from "cors";
import "dotenv/config";
import facturaRoutes from "./routes/facturaRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3020;

app.get("/", (req, res) => {
  res.send({ mensaje: "Bienvenido a la API de Farmapatria-ICG v1.0.0" });
});

app.use("/api/facturas", facturaRoutes);

app.listen(port, () => {
  console.log(`Servicio del API corriendo en http://localhost:${port}`);
});
