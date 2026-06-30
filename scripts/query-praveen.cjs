require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const registrations = await sql`SELECT * FROM registrations WHERE first_name ILIKE '%praveen%' OR last_name ILIKE '%praveen%'`;
  console.log("Registrations:", registrations);
  
  const nominations = await sql`SELECT * FROM nominations WHERE full_name ILIKE '%praveen%'`;
  console.log("Nominations:", nominations);
  
  // also donations
  const donations = await sql`SELECT * FROM donations WHERE full_name ILIKE '%praveen%'`;
  console.log("Donations:", donations);
}

main().catch(console.error);
