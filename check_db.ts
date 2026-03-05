import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

// Use AP connection string
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_SuAd6OG4irQF@ep-broad-poetry-a1kx8dqg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" });
pool.query("SELECT id, name, category, active FROM panels").then(res => {
    console.log(res.rows);
    process.exit(0);
}).catch(console.error);
