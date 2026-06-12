import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const program = String(body.program ?? "").trim();
  const kcseGrade = String(body.kcse_mean_grade ?? "").trim();
  const kcseYear = body.kcse_year ? Number(body.kcse_year) : null;

  if (!fullName || !email || !phone || !program || !kcseGrade) {
    return NextResponse.json({ error: "Missing required application fields." }, { status: 400 });
  }

  const result = await query<{ id: string }>(
    `INSERT INTO applications (
      full_name,
      email,
      phone,
      program,
      kcse_mean_grade,
      kcse_year,
      status,
      source
    ) VALUES ($1,$2,$3,$4,$5,$6,'new','website')
    RETURNING id::text`,
    [fullName, email, phone, program, kcseGrade, kcseYear]
  );

  return NextResponse.json({ ok: true, id: result.rows[0]?.id });
}
