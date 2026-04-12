import { format } from "date-fns";

import { OrdersChart } from "@/components/orders-chart";
import { TelegramTestPanel } from "@/components/telegram-test-panel";
import { getDashboardData } from "@/lib/dashboard";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

export const revalidate = 0;

export default async function HomePage() {
  const dashboard = await getDashboardData();

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">GBC analytics dashboard</span>
          <h1>Заказы RetailCRM в одном read-model для отчётности, мониторинга и Telegram-алертов.</h1>
          <p className="hero-copy">
            Дашборд читает только Supabase, а синхронизация и high-value уведомления запускаются
            отдельно через скрипт или Vercel Cron.
          </p>
        </div>

        <div className="hero-meta">
          <div>
            <span className="label">Последняя синхронизация</span>
            <strong>
              {dashboard.syncState.lastUpdatedAt
                ? format(new Date(dashboard.syncState.lastUpdatedAt), "dd.MM.yyyy HH:mm")
                : "Нет данных"}
            </strong>
          </div>
          <div>
            <span className="label">Состояние окружения</span>
            <strong>{dashboard.syncState.hasCredentials ? "Готово к sync" : "Нужны ключи"}</strong>
          </div>
          <TelegramTestPanel />
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Всего заказов</span>
          <strong>{formatCompactNumber(dashboard.metrics.totalOrders)}</strong>
        </article>
        <article className="stat-card">
          <span>Сумма заказов</span>
          <strong>{formatCurrency(dashboard.metrics.totalRevenue)}</strong>
        </article>
        <article className="stat-card">
          <span>Средний чек</span>
          <strong>{formatCurrency(dashboard.metrics.averageCheck)}</strong>
        </article>
        <article className="stat-card accent-card">
          <span>Заказы &gt; 50 000</span>
          <strong>{formatCompactNumber(dashboard.metrics.highValueOrders)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Выручка и поток</span>
              <h2>Динамика заказов по дням</h2>
            </div>
          </div>
          {dashboard.dailyOrders.length > 0 ? (
            <OrdersChart data={dashboard.dailyOrders} />
          ) : (
            <div className="empty-state">
              <p>Данных пока нет. Сначала выполните импорт и синхронизацию.</p>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">География</span>
              <h2>Города по выручке</h2>
            </div>
          </div>
          <div className="city-list">
            {dashboard.cityBreakdown.length > 0 ? (
              dashboard.cityBreakdown.map((city) => (
                <div className="city-row" key={city.city}>
                  <div>
                    <strong>{city.city}</strong>
                    <span>{city.count} заказов</span>
                  </div>
                  <strong>{formatCurrency(city.revenue)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state compact">
                <p>После sync здесь появится разрез по городам.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Операционный срез</span>
            <h2>Последние заказы</h2>
          </div>
        </div>

        {dashboard.recentOrders.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Заказ</th>
                  <th>Клиент</th>
                  <th>Город</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Telegram</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.retailcrm_id}>
                    <td>#{order.order_number ?? order.retailcrm_id}</td>
                    <td>{order.full_name}</td>
                    <td>{order.city}</td>
                    <td>{order.status}</td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{order.telegram_alert_sent_at ? "Отправлен" : "Нет"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state compact">
            <p>Пока нет строк для отображения.</p>
          </div>
        )}
      </section>
    </main>
  );
}
