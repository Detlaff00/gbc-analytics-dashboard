import { NextRequest, NextResponse } from "next/server";

import { syncOrdersFromRetailCrm } from "@/lib/sync-orders";
import { getOptionalEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const secret = getOptionalEnv("SYNC_API_SECRET") ?? getOptionalEnv("CRON_SECRET");

  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncOrdersFromRetailCrm();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown sync error",
      },
      { status: 500 },
    );
  }
}
