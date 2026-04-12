import { RetailCrmOrder, OrderRecord } from "@/lib/types";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}

function resolveOrderCreatedAt(order: RetailCrmOrder): string | null {
  const createdAt =
    toStringOrNull(order.createdAt) ??
    toStringOrNull(order["created_at"]) ??
    toStringOrNull(order["created"]);

  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapRetailCrmOrder(order: RetailCrmOrder): OrderRecord {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.initialPrice),
    0,
  );
  const customFields = order.customFields ?? {};

  return {
    retailcrm_id: String(order.id ?? order.number ?? crypto.randomUUID()),
    order_number: toStringOrNull(order.number ?? order.id),
    first_name: toStringOrNull(order.firstName),
    last_name: toStringOrNull(order.lastName),
    phone: toStringOrNull(order.phone),
    email: toStringOrNull(order.email),
    status: toStringOrNull(order.status),
    order_type: toStringOrNull(order.orderType),
    order_method: toStringOrNull(order.orderMethod),
    city: toStringOrNull(order.delivery?.address?.city),
    address_text: toStringOrNull(order.delivery?.address?.text),
    utm_source: toStringOrNull(customFields["utm_source"]),
    items_count: itemsCount,
    total_amount: totalAmount,
    order_created_at: resolveOrderCreatedAt(order),
    raw_payload: order,
  };
}
