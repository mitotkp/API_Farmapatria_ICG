import sql from "mssql";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const appPool = new sql.ConnectionPool(config);

const poolConnect = appPool
  .connect()
  .then((pool) => {
    console.log("Pool de conexiones configurado exitosamente");
    return pool;
  })
  .catch((error) => {
    console.error("Error al configurar el pool de conexiones:", error);
    throw error;
  });

export const getConnection = async () => {
  const pool = await poolConnect;
  if (!pool) throw new Error("Error al obtener la conexion");
  return pool;
};

export { sql };
