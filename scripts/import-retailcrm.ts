import fs from "node:fs/promises";
import path from "node:path";

import { createRetailCrmOrder } from "@/lib/retailcrm";
import type { MockOrder } from "@/lib/types";

function formatRetailCrmDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function main() {
  const filePath = path.join(process.cwd(), "mock_orders.json");
  const content = await fs.readFile(filePath, "utf-8");
  const orders = JSON.parse(content) as MockOrder[];

  let created = 0;

  for (const [index, order] of orders.entries()) {
    const payload = {
      ...order,
      orderType: "main",
      orderMethod: order.orderMethod ?? "shopping-cart",
      number: `AI-${String(index + 1).padStart(3, "0")}`,
      createdAt: formatRetailCrmDate(new Date(Date.now() - index * 86_400_000)),
    };
    const response = await createRetailCrmOrder(payload);

    if (!response.success) {
      throw new Error(`RetailCRM rejected order ${index + 1}: ${JSON.stringify(response.errors)}`);
    }

    created += 1;
  }

  console.log(`Imported ${created} orders into RetailCRM`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
