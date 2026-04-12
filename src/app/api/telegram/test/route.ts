import { NextRequest, NextResponse } from "next/server";

import { getOptionalEnv } from "@/lib/env";
import { canUseTelegram, sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const secret = getOptionalEnv("SYNC_API_SECRET") ?? getOptionalEnv("CRON_SECRET");

  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!canUseTelegram()) {
    return NextResponse.json({ error: "Telegram credentials are not configured" }, { status: 500 });
  }

  try {
    await sendTelegramMessage(
      [
        "Тестовое уведомление GBC Analytics Dashboard",
        "Интеграция Telegram работает корректно.",
        `Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" })}`,
      ].join("\n"),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Telegram error",
      },
      { status: 500 },
    );
  }
}
