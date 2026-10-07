import type { Appointment } from "@/features/appointments/types";
import type { OnlineBookingInput } from "@/features/appointments/service";

export class PublicApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new PublicApiError(body?.error ?? "Não foi possível concluir a solicitação.", res.status);
  return body as T;
}

export interface ContactInput {
  name: string;
  phone: string;
  email: string;
  interest: string;
  treatmentId: string | null;
  message: string;
}

/** APIs públicas do site — gravam no mesmo banco lido pelo painel. */
export const publicApi = {
  slots: (professionalId: string, date: string, treatmentId: string) =>
    request<{ slots: string[] }>(
      `/api/public/slots?${new URLSearchParams({ professionalId, date, treatmentId })}`,
    ).then((r) => r.slots),
  book: (input: OnlineBookingInput & { website?: string }) =>
    request<{ appointment: Appointment }>("/api/public/bookings", { method: "POST", body: JSON.stringify(input) }).then((r) => r.appointment),
  contact: (input: ContactInput & { website?: string }) =>
    request<{ ok: true }>("/api/public/contact", { method: "POST", body: JSON.stringify(input) }),
};
