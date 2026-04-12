import test from "node:test";
import assert from "node:assert/strict";

import { mapRetailCrmOrder } from "@/lib/order-mapper";

test("mapRetailCrmOrder normalizes totals and customer fields", () => {
  const record = mapRetailCrmOrder({
    id: 123,
    number: "AI-123",
    firstName: "Айгуль",
    lastName: "Касымова",
    phone: "+77001234501",
    email: "aigul@example.com",
    status: "new",
    orderType: "eshop-individual",
    orderMethod: "shopping-cart",
    createdAt: "2026-04-01T10:00:00.000Z",
    items: [
      { quantity: 1, initialPrice: 15000 },
      { quantity: 2, initialPrice: 10000 },
    ],
    delivery: {
      address: {
        city: "Алматы",
        text: "ул. Абая 150, кв 12",
      },
    },
    customFields: {
      utm_source: "instagram",
    },
  });

  assert.equal(record.retailcrm_id, "123");
  assert.equal(record.items_count, 3);
  assert.equal(record.total_amount, 35000);
  assert.equal(record.city, "Алматы");
  assert.equal(record.utm_source, "instagram");
  assert.equal(record.order_created_at, "2026-04-01T10:00:00.000Z");
});
