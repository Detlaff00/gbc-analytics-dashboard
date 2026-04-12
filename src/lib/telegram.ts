import { getEnv, hasEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { DashboardOrderRow } from "@/lib/types";

export function canUseTelegram(): boolean {
  return hasEnv(["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]);
}

export async function sendHighValueOrderAlert(order: DashboardOrderRow): Promise<void> {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const chatId = getEnv("TELEGRAM_CHAT_ID");
  const message = [
    `Новый заказ > 50 000 ₸: #${order.order_number ?? order.retailcrm_id}`,
    order.full_name,
    `${order.city || "Город не указан"}`,
    `${formatCurrency(order.total_amount)}`,
  ].join(", ");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${text}`);
  }
}
