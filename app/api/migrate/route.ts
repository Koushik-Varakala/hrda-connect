import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Add the missing columns directly using raw SQL
    // This runs from Vercel's servers, which bypasses your local IP restrictions!
    await db.execute(sql`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS "mbbs_or_pg_year" text,
      ADD COLUMN IF NOT EXISTS "year_of_admission" text,
      ADD COLUMN IF NOT EXISTS "university_reg_number" text,
      ADD COLUMN IF NOT EXISTS "college_name" text,
      ADD COLUMN IF NOT EXISTS "university_name" text;
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database columns added successfully! The 500 error should now be fixed." 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error) 
    }, { status: 500 });
  }
}
