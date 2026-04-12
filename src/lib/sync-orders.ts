import { mapRetailCrmOrder } from "@/lib/order-mapper";
import { listRetailCrmOrders } from "@/lib/retailcrm";
import { canUseSupabaseAdmin, getSupabaseAdminClient } from "@/lib/supabase";
import { canUseTelegram, sendHighValueOrderAlert } from "@/lib/telegram";
import { buildFullName } from "@/lib/utils";
import { OrderRecord } from "@/lib/types";

type SyncResult = {
  fetched: number;
  upserted: number;
  alertsSent: number;
  skippedAlerts: number;
};

async function sendAlerts(records: OrderRecord[]): Promise<Pick<SyncResult, "alertsSent" | "skippedAlerts">> {
  if (!canUseTelegram() || records.length === 0) {
    return {
      alertsSent: 0,
      skippedAlerts: records.length,
    };
  }

  const supabase = getSupabaseAdminClient();
  const thresholdRecords = records.filter((record) => record.total_amount > 50000);

  if (thresholdRecords.length === 0) {
    return {
      alertsSent: 0,
      skippedAlerts: 0,
    };
  }

  const ids = thresholdRecords.map((record) => record.retailcrm_id);
  const { data: existingAlerts, error: selectError } = await supabase
    .from("orders")
    .select("retailcrm_id, telegram_alert_sent_at")
    .in("retailcrm_id", ids);

  if (selectError) {
    throw selectError;
  }

  const alertMap = new Map(
    (existingAlerts ?? []).map((row) => [row.retailcrm_id as string, row.telegram_alert_sent_at as string | null]),
  );

  let alertsSent = 0;
  let skippedAlerts = 0;

  for (const record of thresholdRecords) {
    if (alertMap.get(record.retailcrm_id)) {
      skippedAlerts += 1;
      continue;
    }

    await sendHighValueOrderAlert({
      retailcrm_id: record.retailcrm_id,
      order_number: record.order_number,
      full_name: buildFullName(record.first_name, record.last_name),
      city: record.city ?? "Город не указан",
      status: record.status ?? "unknown",
      total_amount: record.total_amount,
      order_created_at: record.order_created_at,
      telegram_alert_sent_at: null,
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ telegram_alert_sent_at: new Date().toISOString() })
      .eq("retailcrm_id", record.retailcrm_id);

    if (updateError) {
      throw updateError;
    }

    alertsSent += 1;
  }

  return { alertsSent, skippedAlerts };
}

export async function syncOrdersFromRetailCrm(): Promise<SyncResult> {
  if (!canUseSupabaseAdmin()) {
    throw new Error("Supabase credentials are not configured");
  }

  const retailOrders = await listRetailCrmOrders();
  const normalizedOrders = retailOrders.map(mapRetailCrmOrder);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("orders").upsert(normalizedOrders, {
    onConflict: "retailcrm_id",
  });

  if (error) {
    throw error;
  }

  const alertStats = await sendAlerts(normalizedOrders);

  return {
    fetched: retailOrders.length,
    upserted: normalizedOrders.length,
    alertsSent: alertStats.alertsSent,
    skippedAlerts: alertStats.skippedAlerts,
  };
}
