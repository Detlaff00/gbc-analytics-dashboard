"use client";

import { FormEvent, useState } from "react";

type StatusState =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function TelegramTestPanel() {
  const [secret, setSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: "Введи sync secret и отправь тестовое сообщение в Telegram.",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "Отправка тестового уведомления..." });

    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Test alert request failed");
      }

      setStatus({ type: "success", message: "Тестовое сообщение отправлено в Telegram." });
      setSecret("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Не удалось отправить сообщение",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="telegram-test-panel" onSubmit={handleSubmit}>
      <div>
        <span className="label">Проверка Telegram</span>
        <strong>Отправить тестовое уведомление</strong>
      </div>

      <label className="telegram-secret-field">
        <span>Sync secret</span>
        <input
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          placeholder="Bearer secret"
          autoComplete="off"
          required
        />
      </label>

      <button className="hero-action" disabled={isSubmitting}>
        {isSubmitting ? "Отправка..." : "Send test alert"}
      </button>

      <p className={`telegram-status ${status.type}`}>{status.message}</p>
    </form>
  );
}
