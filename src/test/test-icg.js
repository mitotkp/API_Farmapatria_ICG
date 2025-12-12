import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sql from "mssql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

console.log("Ruta actual de ejecución:", process.cwd());
console.log("Intentando leer DB_HOST:", process.env.DB_HOST);

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const testConnectionIcg = async () => {
  try {
    console.log("Conectando a ICG...");
    const pool = await sql.connect(dbConfig);
    console.log("Conexión exitosa a ICG");

    const result = await pool.request().query(`
            SELECT TOP 5 * FROM 
            FACTURASVENTA
            ORDER BY Fecha DESC
        `);

    console.log("📄 Últimas 5 Facturas encontradas:");
    console.table(result.recordset);

    await pool.close();
  } catch (error) {
    console.error("Error conectando a ICG:", error.message);
    if (error.code === "ESOCKET") {
      console.log(
        "Verifica que TCP/IP esté habilitado en SQL Server Configuration Manager."
      );
    }
    console.log(error);
  }
};

testConnectionIcg();
