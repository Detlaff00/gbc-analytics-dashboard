import { getEnv } from "@/lib/env";
import { RetailCrmOrder } from "@/lib/types";

type RetailCrmListResponse = {
  success: boolean;
  orders?: RetailCrmOrder[];
  pagination?: {
    totalPageCount?: number;
    currentPage?: number;
  };
};

type RetailCrmCreateResponse = {
  success: boolean;
  id?: number;
  errors?: Record<string, string>;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

async function retailCrmRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = normalizeBaseUrl(getEnv("RETAILCRM_URL"));
  const apiKey = getEnv("RETAILCRM_API_KEY");
  const url = new URL(`${baseUrl}${path}`);

  if (!url.searchParams.has("apiKey")) {
    url.searchParams.set("apiKey", apiKey);
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RetailCRM request failed: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export async function createRetailCrmOrder(order: RetailCrmOrder): Promise<RetailCrmCreateResponse> {
  const formData = new URLSearchParams();
  formData.set("site", "default");
  formData.set("order", JSON.stringify(order));

  return retailCrmRequest<RetailCrmCreateResponse>("/api/v5/orders/create", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function listRetailCrmOrders(): Promise<RetailCrmOrder[]> {
  const orders: RetailCrmOrder[] = [];
  let page = 1;
  let totalPageCount = 1;

  while (page <= totalPageCount) {
    const payload = await retailCrmRequest<RetailCrmListResponse>(
      `/api/v5/orders?limit=100&page=${page}`,
    );

    if (!payload.success) {
      throw new Error("RetailCRM returned unsuccessful response for list orders");
    }

    orders.push(...(payload.orders ?? []));
    totalPageCount = payload.pagination?.totalPageCount ?? page;
    page += 1;
  }

  return orders;
}
