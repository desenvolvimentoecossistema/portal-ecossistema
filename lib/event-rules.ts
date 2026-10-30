export const EVENT_TYPES = [
  "Visita técnica",
  "Visita a território",
  "Evento institucional",
  "Encontro formativo",
  "Outro",
] as const;

export function normalizeEventType(value: string) {
  if (value === "Imersão") return "Visita técnica";
  if (value === "Encontro de programa") return "Encontro formativo";
  return value;
}

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;

export function normalizeOrganization(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function todayInSaoPaulo(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isRegistrationOpen(deadline: string, today = todayInSaoPaulo()) {
  return deadline >= today;
}

export function isEventReadyForRegistration(event: { startDate: string; endDate: string; startTime: string; endTime: string; registrationDeadline: string; city: string; maxParticipants: number }) {
  return Boolean(event.startDate && event.endDate && event.startTime && event.endTime && event.registrationDeadline && event.city.trim() && event.maxParticipants > 0);
}

export function sortEventsByStartDate<T extends { startDate: string; title: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    (a.startDate || "9999-12-31").localeCompare(b.startDate || "9999-12-31") || a.title.localeCompare(b.title, "pt-BR"),
  );
}

function asDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function formatEventDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "Data a confirmar";
  const start = asDate(startDate);
  const end = asDate(endDate);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
  const full = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  if (startDate === endDate) return full.format(start).replace(" de ", " ");
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${day.format(start)}–${full.format(end).replace(" de ", " ")}`;
  }
  return `${full.format(start).replace(" de ", " ")} — ${full.format(end).replace(" de ", " ")}`;
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time;
  return minutes === "00" ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}

export function formatEventTimeRange(startTime: string, endTime: string) {
  if (!startTime || !endTime) return "Horário a confirmar";
  return `${formatTime(startTime)}–${formatTime(endTime)}`;
}
