"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

type OrdersChartProps = {
  data: Array<{
    day: string;
    count: number;
    revenue: number;
  }>;
};

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f6fed" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2f6fed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(85, 101, 132, 0.18)" />
          <XAxis dataKey="day" stroke="#556584" tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#556584"
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis yAxisId="right" orientation="right" hide />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 16,
            }}
            formatter={(value, key) => {
              if (key === "revenue") {
                return [formatCurrency(Number(value)), "Выручка"];
              }

              return [value, "Заказы"];
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#2f6fed"
            strokeWidth={3}
            fill="url(#colorRevenue)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="count"
            stroke="#f97316"
            strokeWidth={2}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
