import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_SuAd6OG4irQF@ep-broad-poetry-a1kx8dqg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'panels'").then(res => {
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
});
