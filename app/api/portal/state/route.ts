import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STATE_KEY = "school_portal";

const getInitialState = () => ({
  users: [],
  programs: [],
  courses: [],
  modules: [],
  cohorts: [],
  classes: [],
  lecturers: [],
  moduleLecturers: [],
  rooms: [],
  applicants: [],
  acceptances: [],
  onboardings: [],
  courseFees: [],
  invoices: [],
  payments: [],
  hostelBookings: [],
  studentAssignments: [],
  learningMaterials: [],
  medicalAttachments: [],
  exams: [],
  examResults: [],
  departmentClearances: [],
  graduations: [],
});

export async function GET() {
  await query(
    `CREATE TABLE IF NOT EXISTS portal_state_store (
      state_key TEXT PRIMARY KEY,
      state_data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  const result = await query<{ state_data: unknown }>(
    "SELECT state_data FROM portal_state_store WHERE state_key = $1",
    [STATE_KEY]
  );

  const existingState = result.rows[0]?.state_data;
  if (
    existingState &&
    typeof existingState === "object" &&
    Object.keys(existingState as Record<string, unknown>).length > 0
  ) {
    return NextResponse.json({ state: existingState });
  }

  const state = getInitialState();
  await query(
    `INSERT INTO portal_state_store (state_key, state_data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (state_key) DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = NOW()`,
    [STATE_KEY, JSON.stringify(state)]
  );

  return NextResponse.json({ state });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("admin") && !user.roles.includes("student"))) {
    return NextResponse.json({ error: "Authenticated portal access is required." }, { status: 403 });
  }

  const body = await request.json();
  if (!body?.state || typeof body.state !== "object") {
    return NextResponse.json({ error: "State payload is required." }, { status: 400 });
  }

  await query(
    `CREATE TABLE IF NOT EXISTS portal_state_store (
      state_key TEXT PRIMARY KEY,
      state_data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  await query(
    `INSERT INTO portal_state_store (state_key, state_data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (state_key) DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = NOW()`,
    [STATE_KEY, JSON.stringify(body.state)]
  );

  return NextResponse.json({ ok: true });
}
