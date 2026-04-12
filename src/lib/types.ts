export type MockOrderItem = {
  productName: string;
  quantity: number;
  initialPrice: number;
};

export type MockOrder = {
  id?: number | string;
  number?: string;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  orderType?: string;
  orderMethod?: string;
  status?: string;
  items?: MockOrderItem[];
  delivery?: {
    address?: {
      city?: string;
      text?: string;
    };
  };
  customFields?: Record<string, string | number | boolean | null>;
};

export type RetailCrmOrder = Record<string, unknown> & {
  id?: number | string;
  number?: string;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  orderType?: string;
  orderMethod?: string;
  status?: string;
  items?: Array<{
    quantity?: number;
    initialPrice?: number;
  }>;
  delivery?: {
    address?: {
      city?: string;
      text?: string;
    };
  };
  customFields?: Record<string, string | number | boolean | null>;
};

export type OrderRecord = {
  retailcrm_id: string;
  order_number: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  order_type: string | null;
  order_method: string | null;
  city: string | null;
  address_text: string | null;
  utm_source: string | null;
  items_count: number;
  total_amount: number;
  order_created_at: string | null;
  raw_payload: RetailCrmOrder;
};

export type DashboardMetrics = {
  totalOrders: number;
  totalRevenue: number;
  averageCheck: number;
  highValueOrders: number;
};

export type DashboardOrderRow = {
  retailcrm_id: string;
  order_number: string | null;
  full_name: string;
  city: string;
  status: string;
  total_amount: number;
  order_created_at: string | null;
  telegram_alert_sent_at: string | null;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  dailyOrders: Array<{
    day: string;
    count: number;
    revenue: number;
  }>;
  cityBreakdown: Array<{
    city: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: DashboardOrderRow[];
  syncState: {
    lastUpdatedAt: string | null;
    hasCredentials: boolean;
  };
};
