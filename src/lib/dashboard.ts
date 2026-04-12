import { format } from "date-fns";

import { canUseSupabaseRead, getSupabaseReadClient } from "@/lib/supabase";
import { buildFullName } from "@/lib/utils";
import { DashboardData } from "@/lib/types";

type OrderRow = {
  retailcrm_id: string;
  order_number: string | null;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  status: string | null;
  total_amount: number;
  order_created_at: string | null;
  updated_at: string | null;
  telegram_alert_sent_at: string | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  if (!canUseSupabaseRead()) {
    return {
      metrics: {
        totalOrders: 0,
        totalRevenue: 0,
        averageCheck: 0,
        highValueOrders: 0,
      },
      dailyOrders: [],
      cityBreakdown: [],
      recentOrders: [],
      syncState: {
        lastUpdatedAt: null,
        hasCredentials: false,
      },
    };
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "retailcrm_id, order_number, first_name, last_name, city, status, total_amount, order_created_at, updated_at, telegram_alert_sent_at",
    )
    .order("order_created_at", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as OrderRow[];
  const totalOrders = rows.length;
  const totalRevenue = rows.reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const highValueOrders = rows.filter((row) => row.total_amount > 50000).length;
  const averageCheck = totalOrders === 0 ? 0 : Math.round(totalRevenue / totalOrders);

  const dailyMap = new Map<string, { day: string; count: number; revenue: number }>();
  const cityMap = new Map<string, { city: string; count: number; revenue: number }>();

  for (const row of rows) {
    const dateKey = row.order_created_at ? format(new Date(row.order_created_at), "yyyy-MM-dd") : "unknown";
    const currentDay = dailyMap.get(dateKey) ?? { day: dateKey, count: 0, revenue: 0 };
    currentDay.count += 1;
    currentDay.revenue += row.total_amount ?? 0;
    dailyMap.set(dateKey, currentDay);

    const cityKey = row.city ?? "Не указан";
    const currentCity = cityMap.get(cityKey) ?? { city: cityKey, count: 0, revenue: 0 };
    currentCity.count += 1;
    currentCity.revenue += row.total_amount ?? 0;
    cityMap.set(cityKey, currentCity);
  }

  const recentOrders = rows.slice(0, 12).map((row) => ({
    retailcrm_id: row.retailcrm_id,
    order_number: row.order_number,
    full_name: buildFullName(row.first_name, row.last_name),
    city: row.city ?? "Не указан",
    status: row.status ?? "unknown",
    total_amount: row.total_amount ?? 0,
    order_created_at: row.order_created_at,
    telegram_alert_sent_at: row.telegram_alert_sent_at,
  }));

  const lastUpdatedAt = rows.reduce<string | null>((latest, row) => {
    if (!row.updated_at) {
      return latest;
    }

    if (!latest || new Date(row.updated_at) > new Date(latest)) {
      return row.updated_at;
    }

    return latest;
  }, null);

  return {
    metrics: {
      totalOrders,
      totalRevenue,
      averageCheck,
      highValueOrders,
    },
    dailyOrders: Array.from(dailyMap.values()).sort((a, b) => a.day.localeCompare(b.day)),
    cityBreakdown: Array.from(cityMap.values()).sort((a, b) => b.revenue - a.revenue),
    recentOrders,
    syncState: {
      lastUpdatedAt,
      hasCredentials: true,
    },
  };
}
