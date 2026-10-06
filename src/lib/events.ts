export const EVENTS_KEY = "groww-starter-prototype-events-v1";

export const PROTOTYPE_EVENTS = [
  "starter_started",
  "snapshot_completed",
  "goal_completed",
  "risk_completed",
  "plan_viewed",
  "simulation_started",
  "firewall_triggered",
  "simulation_saved",
  "journey_completed",
] as const;

export type PrototypeEventName = (typeof PROTOTYPE_EVENTS)[number];

export interface PrototypeEvent {
  name: PrototypeEventName;
  at: string;
}

const EVENT_LIMIT = 80;

export function appendEvent(
  events: PrototypeEvent[],
  name: PrototypeEventName,
  at: string,
): PrototypeEvent[] {
  if (name === "journey_completed" && events.some((event) => event.name === name)) {
    return events;
  }
  const last = events[events.length - 1];
  if (last && last.name === name) {
    const gap = Math.abs(Date.parse(at) - Date.parse(last.at));
    if (Number.isFinite(gap) && gap < 2000) return events;
  }
  return [...events, { name, at }].slice(-EVENT_LIMIT);
}

export function sanitizeEvents(value: unknown): PrototypeEvent[] {
  if (!Array.isArray(value)) return [];
  const events: PrototypeEvent[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as { name?: unknown; at?: unknown };
    if (typeof record.name !== "string" || typeof record.at !== "string") continue;
    if (!PROTOTYPE_EVENTS.includes(record.name as PrototypeEventName)) continue;
    events.push({ name: record.name as PrototypeEventName, at: record.at });
  }
  return events.slice(-EVENT_LIMIT);
}

export function loadPrototypeEvents(): PrototypeEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return sanitizeEvents(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function recordEvent(name: PrototypeEventName): void {
  if (typeof window === "undefined") return;
  const current = loadPrototypeEvents();
  const next = appendEvent(current, name, new Date().toISOString());
  if (next === current) return;
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
}

export function clearPrototypeEvents(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(EVENTS_KEY);
}
