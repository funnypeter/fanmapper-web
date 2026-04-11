import { NextResponse } from "next/server";
import { generatePolls } from "@/lib/services/pollGenerator";

export async function POST() {
  const success = await generatePolls();
  if (!success) {
    return NextResponse.json({ error: "Failed to generate polls" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
