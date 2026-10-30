"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {PortalHero} from "@/components/hub-layout";
import { SegmentedOrbit } from "@/components/segmented-orbit";
import {
  ArrowRight,
  BedDouble,
  Bus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  Pencil,
  Search,
  List,
  Sparkles,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import type { EcosystemEvent } from "@/lib/event-data";
import { isEventOwner } from "@/lib/event-ownership";
import {
  formatEventDateRange,
  formatEventTimeRange,
  isEventReadyForRegistration,
  isRegistrationOpen,
  sortEventsByStartDate,
} from "@/lib/event-rules";
import {
  CORE_ORGANIZATIONS,
  getOrganizationBrand,
} from "@/lib/organization-brand";

const dialogCloseButtonClass =
  "[&_[data-slot=dialog-close]]:grid [&_[data-slot=dialog-close]]:size-9 [&_[data-slot=dialog-close]]:place-items-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border [&_[data-slot=dialog-close]]:border-[#052B47]/20 [&_[data-slot=dialog-close]]:bg-white [&_[data-slot=dialog-close]]:text-[#052B47] [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow-sm [&_[data-slot=dialog-close]]:hover:bg-[#E8F3EF] [&_[data-slot=dialog-close]]:focus-visible:ring-2 [&_[data-slot=dialog-close]]:focus-visible:ring-[#B2C530] [&_[data-slot=dialog-close]]:focus-visible:ring-offset-2";

type AppUser = {
  userId: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
};

type EventRegistration = {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  createdAt: string;
};

type ManagedUser = {
  email: string;
  displayName: string;
  role: "admin" | "user";
  protected: boolean;
};

function asDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function dateRange(event: EcosystemEvent) {
  if (event.dateNote) return event.dateNote;
  return formatEventDateRange(event.startDate, event.endDate);
}

function timeRange(event: EcosystemEvent) {
  return formatEventTimeRange(event.startTime, event.endTime);
}

function Field({ label, name, type = "text", placeholder, required = true, className = "", min, max, defaultValue, autoComplete }: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  min?: string;
  max?: string;
  defaultValue?: string | number;
  autoComplete?: string;
}) {
  return (
    <label className={`grid min-w-0 gap-1.5 text-sm font-semibold text-[#052B47] ${className}`}>
      <span>{label} {required ? <span className="text-[#B42318]" aria-hidden="true">*</span> : <span className="font-normal text-[#052B47]/70">(opcional)</span>}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} min={min} max={max} defaultValue={defaultValue} autoComplete={autoComplete} className="h-11 w-full min-w-0 rounded-xl border border-[#052B47]/20 bg-white px-3.5 text-base font-normal text-[#052B47] outline-none transition placeholder:text-[#052B47]/60 focus:border-[#00A180] focus:ring-2 focus:ring-[#00A180]/15" />
    </label>
  );
}

function TextArea({ label, name, placeholder, hint, className = "", required = true, defaultValue, minLength, maxLength }: {
  label: string;
  name: string;
  placeholder?: string;
  hint?: string;
  className?: string;
  required?: boolean;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className={`grid min-w-0 gap-1.5 text-sm font-semibold text-[#052B47] ${className}`}>
      <span>{label} {required ? <span className="text-[#B42318]" aria-hidden="true">*</span> : <span className="font-normal text-[#052B47]/70">(opcional)</span>}</span>
      {hint && <span className="text-sm font-normal leading-relaxed text-[#052B47]/70">{hint}</span>}
      <textarea name={name} placeholder={placeholder} required={required} minLength={minLength} maxLength={maxLength} rows={3} defaultValue={defaultValue} className="w-full min-w-0 resize-y rounded-xl border border-[#052B47]/20 bg-white px-3.5 py-3 text-base font-normal leading-relaxed text-[#052B47] outline-none transition placeholder:text-[#052B47]/60 focus:border-[#00A180] focus:ring-2 focus:ring-[#00A180]/15" />
    </label>
  );
}

function InfoRow({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3 border-b border-[#052B47]/15 py-4 last:border-0">
      <span className="grid size-9 place-items-center rounded-full bg-[#E8F3EF] text-[#00A180]"><Icon className="size-4" aria-hidden="true" /></span>
      <div>
        <p className="text-sm font-bold text-[#052B47]">{title}</p>
        <div className="mt-1 text-base leading-relaxed text-[#052B47]">{children}</div>
      </div>
    </div>
  );
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12);
  const start = new Date(firstDay);
  const end = new Date(lastDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: Date[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }
  return days;
}

function CalendarView({ events, onSelect }: { events: EcosystemEvent[]; onSelect: (event: EcosystemEvent) => void }) {
  const initialMonth = useMemo(() => {
    const today = isoDate(new Date());
    const nextEvent = events.find((event) => event.endDate >= today) ?? events[0];
    return asDate(nextEvent.startDate);
  }, [events]);
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => { setMonth(initialMonth); }, [initialMonth]);

  const days = useMemo(() => calendarDays(month), [month]);
  const rawMonthTitle = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month);
  const monthTitle = rawMonthTitle.charAt(0).toUpperCase() + rawMonthTitle.slice(1);
  const todayIso = isoDate(new Date());

  function changeMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#052B47]/12 bg-white shadow-[0_8px_26px_rgba(5,43,71,0.07)]">
      <div className="flex flex-col gap-4 border-b border-[#052B47]/12 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="mt-0.5 text-2xl font-black tracking-[-0.015em]">{monthTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label="Mês anterior" className="size-11 rounded-full border-[#052B47]/20"><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" onClick={() => setMonth(new Date())} className="h-11 rounded-full border-[#052B47]/20 px-5 font-bold">Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label="Próximo mês" className="size-11 rounded-full border-[#052B47]/20"><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      <div className="overflow-x-auto" aria-label={`Agendas de ${monthTitle}`}>
        <div className="min-w-[820px]">
          <div className="grid grid-cols-7 border-b border-[#052B47]/12 bg-[#E8F3EF]">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday) => <div key={weekday} className="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-[0.04em] text-[#052B47]/75">{weekday}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayIso = isoDate(day);
              const dayEvents = events.filter((event) => event.startDate <= dayIso && event.endDate >= dayIso);
              const belongsToMonth = day.getMonth() === month.getMonth();
              const isToday = dayIso === todayIso;
              return (
                <div key={dayIso} className={`min-h-[142px] border-b border-r border-[#052B47]/10 p-2.5 ${belongsToMonth ? "bg-white" : "bg-[#F6F8F3]/75"}`}>
                  <div className={`ml-auto grid size-8 place-items-center rounded-full text-sm font-bold ${isToday ? "bg-[#052B47] text-white" : belongsToMonth ? "text-[#052B47]" : "text-[#052B47]/40"}`}>{day.getDate()}</div>
                  <div className="mt-1.5 space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => {
                      const brand = getOrganizationBrand(event.organization);
                      return (
                        <button key={event.id} onClick={() => onSelect(event)} aria-label={`${event.title}, ${dateRange(event)}`} style={{ borderLeftColor: brand.color }} className="block w-full rounded-lg border border-[#052B47]/10 border-l-4 bg-[#F6F8F3] px-2.5 py-2 text-left transition hover:bg-[#E8F3EF] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A180]">
                          <span className="block text-[11px] font-extrabold text-[#007F68]">{event.startDate === dayIso ? (event.startTime || "Horário a confirmar") : "Em andamento"}</span>
                          <span className="mt-0.5 block truncate text-xs font-extrabold text-[#052B47]">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && <p className="px-1 text-xs font-bold text-[#052B47]/65">+ {dayEvents.length - 3} {dayEvents.length - 3 === 1 ? "agenda" : "agendas"}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EcosystemApp({ user, initialQuery="" }: { user: AppUser; initialQuery?:string }) {
  const [events, setEvents] = useState<EcosystemEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const [selected, setSelected] = useState<EcosystemEvent | null>(null);
  const [registrationEvent, setRegistrationEvent] = useState<EcosystemEvent | null>(null);
  const [registrationOrganization, setRegistrationOrganization] = useState("");
  const [includeSecondParticipant, setIncludeSecondParticipant] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EcosystemEvent | null>(null);
  const [registrationsEvent, setRegistrationsEvent] = useState<EcosystemEvent | null>(null);
  const [receivedRegistrations, setReceivedRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<EventRegistration | null>(null);
  const [deletingRegistration, setDeletingRegistration] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EcosystemEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [publishOrganization, setPublishOrganization] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [activeSection, setActiveSection] = useState<"agenda" | "como-funciona">("agenda");

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const response = await fetch("/api/events");
      const result = await response.json() as EcosystemEvent[] | { error?: string };
      if (!response.ok || !Array.isArray(result)) {
        throw new Error(!Array.isArray(result) && result.error ? result.error : "Não foi possível carregar a agenda.");
      }
      setEvents(result);
    } catch (error) {
      setEvents([]);
      setEventsError(error instanceof Error ? error.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadEvents); }, [loadEvents]);

  useEffect(() => {
    const sections = ["agenda", "como-funciona"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id === "agenda" || visible?.target.id === "como-funciona") {
        setActiveSection(visible.target.id);
      }
    }, { rootMargin: "-22% 0px -58%", threshold: [0, 0.1, 0.35] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "list_ecosystem_events",
        title: "Listar agendas do Ecossistema",
        description: "Lista as agendas visíveis na agenda, com local, datas e vagas.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async () => events.map(({ id, title, organization, city, state, dateNote, startDate, startTime, endDate, endTime, availableSpots }) => ({ id, title, organization, city, state, dateNote, startDate, startTime, endDate, endTime, availableSpots })),
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {}
    return () => lifecycle.abort();
  }, [events]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return events.filter((event) => {
      const haystack = `${event.title} ${event.organization} ${event.city} ${event.state}`.toLocaleLowerCase("pt-BR");
      return !normalized || haystack.includes(normalized);
    });
  }, [events, query]);

  const available = events.reduce((sum, event) => sum + event.availableSpots, 0);

  function openCreateForm() {
    setEditingEvent(null);
    setPublishOrganization("");
    setPublishOpen(true);
  }

  function openEditForm(event: EcosystemEvent) {
    setSelected(null);
    setEditingEvent(event);
    setPublishOrganization(CORE_ORGANIZATIONS.includes(event.organization as typeof CORE_ORGANIZATIONS[number]) ? event.organization : "");
    setPublishOpen(true);
  }

  async function openUsers() {
    setUsersOpen(true);
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      const result = await response.json() as ManagedUser[] | { error?: string };
      if (!response.ok || !Array.isArray(result)) {
        throw new Error(!Array.isArray(result) && result.error ? result.error : "Não foi possível carregar as permissões.");
      }
      setManagedUsers(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar as permissões.");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function submitUserRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingUser(true);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role: "admin" }),
      });
      const result = await response.json() as ManagedUser | { error?: string };
      if (!response.ok || !("email" in result)) {
        throw new Error("error" in result && result.error ? result.error : "Não foi possível salvar a permissão.");
      }
      setManagedUsers((current) => [...current.filter((item) => item.email !== result.email), result].sort((a, b) => Number(b.protected) - Number(a.protected) || a.email.localeCompare(b.email)));
      form.reset();
      toast.success("Permissão salva");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a permissão.");
    } finally {
      setSavingUser(false);
    }
  }

  async function deleteUserRole(email: string) {
    setSavingUser(true);
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível remover a permissão.");
      setManagedUsers((current) => current.filter((item) => item.email !== email));
      toast.success("Permissão removida");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover a permissão.");
    } finally {
      setSavingUser(false);
    }
  }

  function handlePublishOpenChange(open: boolean) {
    setPublishOpen(open);
    if (!open) {
      setEditingEvent(null);
      setPublishOrganization("");
    }
  }

  async function openRegistrations(event: EcosystemEvent) {
    setSelected(null);
    setRegistrationsEvent(event);
    setReceivedRegistrations([]);
    setLoadingRegistrations(true);
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`);
      const result = await response.json() as EventRegistration[] | { error?: string };
      if (!response.ok) throw new Error("error" in result ? result.error : undefined);
      setReceivedRegistrations(result as EventRegistration[]);
    } catch (error) {
      toast.error(error instanceof Error && error.message !== "error" ? error.message : "Não foi possível carregar as inscrições.");
    } finally {
      setLoadingRegistrations(false);
    }
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registrationEvent) return;
    if (!registrationOrganization) {
      toast.error("Selecione sua organização.");
      return;
    }
    setSubmitting(true);
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const participants = [{ name: fields.name, email: fields.email, role: fields.role }];
    if (includeSecondParticipant) participants.push({ name: fields.secondName, email: fields.secondEmail, role: fields.secondRole });
    try {
      const response = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId: registrationEvent.id, organization: registrationOrganization, participants }) });
      const result = await response.json() as { error?: string; status?: string; confirmationsRequested?: number };
      if (!response.ok) throw new Error(result.error);
      setEvents((current) => current.map((item) => item.id === registrationEvent.id ? { ...item, availableSpots: Math.max(0, item.availableSpots - participants.length) } : item));
      form.reset();
      setRegistrationEvent(null);
      setRegistrationOrganization("");
      setIncludeSecondParticipant(false);
      toast.success(participants.length === 2 ? "Duas inscrições recebidas" : "Inscrição recebida", { description: result.confirmationsRequested === participants.length ? "A confirmação foi solicitada por e-mail para cada pessoa inscrita." : "A inscrição foi registrada, mas não foi possível solicitar a confirmação por e-mail. Consulte a organização anfitriã se precisar confirmar os detalhes." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a inscrição.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRegistration() {
    if (!registrationsEvent || !registrationToDelete) return;
    setDeletingRegistration(true);
    try {
      const response = await fetch(`/api/events/${registrationsEvent.id}/registrations/${registrationToDelete.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setReceivedRegistrations((current) => current.filter((item) => item.id !== registrationToDelete.id));
      setEvents((current) => current.map((item) => item.id === registrationsEvent.id ? { ...item, availableSpots: Math.min(item.maxParticipants, item.availableSpots + 1) } : item));
      setRegistrationsEvent((current) => current ? { ...current, availableSpots: Math.min(current.maxParticipants, current.availableSpots + 1) } : current);
      toast.success("Inscrição excluída", { description: "A vaga voltou a ficar disponível no evento." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a inscrição.");
    } finally {
      setDeletingRegistration(false);
      setRegistrationToDelete(null);
    }
  }

  async function deleteEvent() {
    if (!eventToDelete) return;
    setDeletingEvent(true);
    try {
      const response = await fetch(`/api/events/${eventToDelete.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setEvents((current) => current.filter((item) => item.id !== eventToDelete.id));
      setSelected(null);
      if (registrationsEvent?.id === eventToDelete.id) setRegistrationsEvent(null);
      toast.success(eventToDelete.isDemo ? "Exemplo excluído" : "Agenda excluída", { description: eventToDelete.isDemo ? "O exemplo não aparece mais na agenda." : "A atividade e suas inscrições foram removidas." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a agenda.");
    } finally {
      setDeletingEvent(false);
      setEventToDelete(null);
    }
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!publishOrganization) {
      toast.error("Selecione a organização anfitriã.");
      return;
    }
    setSubmitting(true);
    const form = event.currentTarget;
    const payload = { ...Object.fromEntries(new FormData(form)), organization: publishOrganization };
    try {
      const response = await fetch(editingEvent ? `/api/events/${editingEvent.id}` : "/api/events", { method: editingEvent ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as EcosystemEvent & { error?: string };
      if (!response.ok) throw new Error(result.error);
      setEvents((current) => sortEventsByStartDate(editingEvent ? current.map((item) => item.id === result.id ? result : item) : [...current, result]));
      form.reset();
      setPublishOrganization("");
      setPublishOpen(false);
      setEditingEvent(null);
      toast.success(editingEvent ? "Alterações salvas" : "Agenda compartilhada", { description: editingEvent ? "A agenda já mostra as informações atualizadas." : "Ela já faz parte da agenda do Ecossistema." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível publicar a agenda.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="hub min-h-screen bg-[#F6F8F3] text-[#052B47]">
      <PortalHero className="immersions-hero" title="Imersões em Eventos" description="Participe de agendas do Ecossistema e cadastre eventos da sua organização." back={{href:"/",label:"Início"}}/>
<div className="immersions-guide-wrap"><details id="como-funciona" className="immersions-guide"><summary><h2>Como funciona</h2><span aria-hidden="true">+</span></summary><div className="immersions-guide-content">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <SegmentedOrbit className="absolute -bottom-32 right-[6%] size-80 opacity-30" />
        </div>
        <div className="immersions-guide-inner">
          <div><p className="mt-4 text-lg leading-relaxed text-white/90">As organizações cadastram atividades de seu calendário para receber pessoas do Ecossistema. Você pode consultar as informações e se inscrever nas agendas abertas.</p></div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[['01', 'Compartilhar uma atividade', 'A organização anfitriã informa objetivo, data, local, vagas e orientações logísticas.'], ['02', 'Fazer a inscrição', 'As pessoas consultam as informações e se inscrevem. O limite é de duas pessoas por organização em cada atividade.'], ['03', 'Acompanhar as inscrições', 'Quem criou a atividade consulta a lista de participantes e organiza os próximos passos.']].map(([number, title, copy]) => <li key={number} className="rounded-[20px] border border-white/[0.18] bg-white/[0.11] p-5 shadow-[0_8px_22px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-white/[0.14]"><span className="grid size-9 place-items-center rounded-full bg-[#B2C530] text-sm font-black text-[#052B47]">{number}</span><h3 className="mt-6 text-xl font-black leading-snug">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/90">{copy}</p></li>)}
          </ol>
        </div>
      </div></details></div>
      <section id="agenda" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end">
          <div className="max-w-[680px]">
<div className="inline-flex rounded-full border border-[#052B47]/15 bg-white p-1 shadow-[0_5px_18px_rgba(5,43,71,0.06)]" aria-label="Modo de visualização">
              <button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")} className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition ${viewMode === "cards" ? "bg-[#052B47] text-white" : "text-[#052B47] hover:bg-[#E8F3EF]"}`}><List className="size-4" aria-hidden="true" />Lista</button>
              <button type="button" aria-pressed={viewMode === "calendar"} onClick={() => setViewMode("calendar")} className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition ${viewMode === "calendar" ? "bg-[#052B47] text-white" : "text-[#052B47] hover:bg-[#E8F3EF]"}`}><CalendarDays className="size-4" aria-hidden="true" />Calendário</button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-[#052B47]/10 bg-white p-1.5 shadow-[0_8px_24px_rgba(5,43,71,0.06)] sm:flex-row sm:items-center ">
            <Button onClick={openCreateForm} className="h-11 shrink-0 rounded-xl bg-[#052B47] px-4 font-bold text-white hover:bg-[#007F68]"><Sparkles className="mr-2 size-4"/>Compartilhar agenda</Button>
            <label className="relative min-w-0 flex-1"><span className="sr-only">Buscar agendas</span><Search className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#052B47]/70" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tema, organização ou local" className="h-11 w-full rounded-xl border border-transparent bg-[#F6F8F3] pl-11 pr-4 text-base outline-none placeholder:text-[#052B47]/60 focus:border-[#00A180] focus:bg-white focus:ring-2 focus:ring-[#00A180]/15" /></label>
          </div>
        </div>

        {loadingEvents ? (
          <div className="rounded-2xl border border-[#052B47]/15 bg-white px-6 py-16 text-center" role="status">Carregando agendas…</div>
        ) : eventsError ? (
          <div className="rounded-2xl border border-[#B42318]/30 bg-[#B42318]/5 px-6 py-12 text-center" role="alert">
            <h3 className="text-xl font-black">A agenda não pôde ser carregada</h3>
            <p className="mt-2 text-[#052B47]">{eventsError}</p>
            <Button variant="outline" onClick={() => void loadEvents()} className="mt-5 rounded-full border-[#052B47]/30">Tentar novamente</Button>
          </div>
        ) : filtered.length && viewMode === "calendar" && filtered.some((event) => event.startDate) ? (
          <CalendarView events={filtered.filter((event) => event.startDate)} onSelect={setSelected} />
        ) : filtered.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => (
              <article key={event.id} className="group flex min-h-[390px] flex-col overflow-hidden rounded-[22px] border border-[#052B47]/12 bg-white shadow-[0_8px_26px_rgba(5,43,71,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#052B47]/25 hover:shadow-[0_18px_42px_rgba(5,43,71,0.13)]">
                <div className="h-1.5" style={{ backgroundColor: getOrganizationBrand(event.organization).color }} />
                <div className="flex flex-1 flex-col p-6">
                  {event.isDemo && <div className="flex justify-end"><span className="rounded-full border border-[#052B47]/20 bg-[#052B47]/[0.04] px-2.5 py-1 text-xs font-bold text-[#052B47]">Exemplo</span></div>}
                  <p className="mt-5 text-sm font-extrabold text-[#007F68]">{event.organization}</p>
                  <h3 className="mt-1.5 text-[1.45rem] font-black leading-[1.18] tracking-[-0.015em]">{event.title}</h3>
                  <p className="mt-3 line-clamp-3 text-base leading-relaxed text-[#052B47]/80">{event.description}</p>
                  <div className="mt-auto space-y-2.5 rounded-xl bg-[#F6F8F3] px-4 py-3.5 text-sm font-semibold text-[#052B47]">
                    <p className="flex items-start gap-2.5"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[#00A180]" /><span>{dateRange(event)} · {timeRange(event)}</span></p>
                    <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-[#00A180]" /><span>{event.city ? `${event.city}, ${event.state}` : event.state}</span></p>
                    <p className="flex items-start gap-2.5"><Users className="mt-0.5 size-4 shrink-0 text-[#00A180]" /><span>{isEventReadyForRegistration(event) ? `${event.availableSpots} ${event.availableSpots === 1 ? "vaga disponível" : "vagas disponíveis"}` : "Inscrições em preparação"}</span></p>
                  </div>
                  <button onClick={() => setSelected(event)} className="mt-3 flex h-11 items-center justify-between rounded-xl bg-[#052B47] px-4 text-sm font-extrabold text-white transition hover:bg-[#007F68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A180]">Ver detalhes da agenda <ChevronRight className="size-4 transition group-hover:translate-x-1" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#052B47]/25 bg-white px-6 py-16 text-center"><Search className="mx-auto size-8 text-[#052B47]" /><h3 className="mt-3 text-xl font-black">Nenhuma agenda encontrada</h3><p className="mt-1 text-[#052B47]">Tente outro termo de busca.</p></div>
        )}
        {!loadingEvents && !eventsError && viewMode === "calendar" && filtered.filter((event) => !event.startDate).map((event) => (
          <button key={event.id} onClick={() => setSelected(event)} className="mt-5 w-full rounded-2xl border border-[#052B47]/15 bg-white p-5 text-left shadow-sm hover:bg-[#E8F3EF]">
            <span className="text-xs font-extrabold uppercase text-[#007F68]">{event.organization} · Data a confirmar</span>
            <span className="mt-1 block text-lg font-black">{event.title}</span>
            <span className="mt-1 block text-sm">{event.dateNote ?? "Data a confirmar"}</span>
          </button>
        ))}
      </section>

      




      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className={`${dialogCloseButtonClass} max-h-[94vh] w-[calc(100%-1.5rem)] overflow-x-hidden overflow-y-auto rounded-[22px] border-[#052B47]/20 p-0 sm:max-w-4xl`}>
            <div className="px-6 py-7 pr-14 sm:px-8" style={{ backgroundColor: getOrganizationBrand(selected.organization).color, color: getOrganizationBrand(selected.organization).foreground }}><DialogHeader><p className="text-sm font-extrabold opacity-80">{selected.organization}</p><DialogTitle className="text-2xl font-black leading-tight tracking-normal sm:text-3xl">{selected.title}</DialogTitle><DialogDescription className="text-base leading-relaxed" style={{ color: getOrganizationBrand(selected.organization).foreground }}>{selected.description}</DialogDescription></DialogHeader></div>
            <div className="grid gap-6 px-6 pb-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <InfoRow icon={CalendarDays} title="Datas">{dateRange(selected)}</InfoRow>
                <InfoRow icon={Clock3} title="Horários">{timeRange(selected)}</InfoRow>
                {selected.venue && <InfoRow icon={MapPin} title="Local">{selected.venue}</InfoRow>}
                {selected.transport && <InfoRow icon={Bus} title="Transporte local">{selected.transport}</InfoRow>}
                {selected.accommodation && <InfoRow icon={BedDouble} title="Hospedagem">{selected.accommodation}</InfoRow>}
                {selected.meals && <InfoRow icon={Utensils} title="Alimentação">{selected.meals}</InfoRow>}

                {selected.additionalNotes && <InfoRow icon={FileText} title="Observações adicionais">{selected.additionalNotes}</InfoRow>}
              </div>
              <aside className="h-fit rounded-2xl bg-[#E8F3EF] p-5 lg:sticky lg:top-0">
                <p className="text-xs font-extrabold uppercase tracking-normal text-[#007F68]">Prazo máximo de inscrição</p><p className="mt-1 text-xl font-black">{selected.registrationDeadline ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(asDate(selected.registrationDeadline)) : "A definir"}</p><div className="my-4 h-px bg-[#052B47]/20" /><p className="flex items-center gap-2 text-sm font-bold"><Users className="size-4" /> {isEventReadyForRegistration(selected) ? `${selected.availableSpots} vagas disponíveis` : "Vagas a definir"}</p><p className="mt-2 text-xs leading-relaxed text-[#052B47]">Limite de duas pessoas por organização.</p>
                <Button disabled={!isEventReadyForRegistration(selected) || selected.availableSpots === 0 || selected.isDemo || !isRegistrationOpen(selected.registrationDeadline)} onClick={() => { setRegistrationEvent(selected); setSelected(null); }} className="mt-5 h-12 w-full justify-center rounded-full bg-[#052B47] px-4 text-sm font-extrabold leading-tight text-white hover:bg-[#007F68]">{selected.isDemo ? "Exemplo demonstrativo" : !isEventReadyForRegistration(selected) ? "Inscrições em preparação" : !isRegistrationOpen(selected.registrationDeadline) ? "Inscrições encerradas" : selected.availableSpots === 0 ? "Vagas preenchidas" : "Tenho interesse em participar"} {!selected.isDemo && selected.availableSpots > 0 && isEventReadyForRegistration(selected) && isRegistrationOpen(selected.registrationDeadline) && <ArrowRight className="size-4 shrink-0" />}</Button>
                {!selected.isDemo && (isEventOwner(selected, user) || user.role === "admin") && <Button variant="outline" onClick={() => openEditForm(selected)} className="mt-3 h-11 w-full rounded-full border-[#052B47]/30 bg-transparent font-extrabold text-[#052B47] hover:bg-white"><Pencil className="mr-1.5 size-4" />Editar agenda</Button>}
                {!selected.isDemo && (isEventOwner(selected, user) || user.role === "admin") && <Button variant="outline" onClick={() => void openRegistrations(selected)} className="mt-3 h-11 w-full rounded-full border-[#052B47]/30 bg-transparent font-extrabold text-[#052B47] hover:bg-white"><ClipboardList className="mr-1.5 size-4" />Ver inscrições recebidas</Button>}
                {(user.role === "admin" || (!selected.isDemo && isEventOwner(selected, user))) && <Button variant="outline" onClick={() => setEventToDelete(selected)} className="mt-3 h-11 w-full rounded-full border-[#B42318]/40 bg-transparent font-extrabold text-[#B42318] hover:border-[#B42318] hover:bg-[#B42318]/10 hover:text-[#B42318]"><Trash2 className="mr-1.5 size-4" />Excluir atividade</Button>}
                <p className="mt-5 text-xs leading-relaxed text-[#052B47]">Dúvidas: {selected.contactName}<br /><a className="font-bold underline" href={`mailto:${selected.contactEmail}`}>{selected.contactEmail}</a></p>
              </aside>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={Boolean(registrationsEvent)} onOpenChange={(open) => !open && setRegistrationsEvent(null)}>
        {registrationsEvent && (
          <DialogContent className={`${dialogCloseButtonClass} max-h-[94vh] w-[calc(100%-1.5rem)] overflow-x-hidden overflow-y-auto rounded-[22px] border-[#052B47]/20 p-0 sm:max-w-4xl`}>
            <div className="px-6 py-7 pr-14 sm:px-8" style={{ backgroundColor: getOrganizationBrand(registrationsEvent.organization).color, color: getOrganizationBrand(registrationsEvent.organization).foreground }}>
              <DialogHeader>
                <p className="text-sm font-extrabold opacity-80">{registrationsEvent.organization}</p>
                <DialogTitle className="text-2xl font-black tracking-normal sm:text-3xl">Inscrições recebidas</DialogTitle>
                <DialogDescription className="text-base" style={{ color: getOrganizationBrand(registrationsEvent.organization).foreground }}>{registrationsEvent.title}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-5 pb-8 sm:px-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#052B47]/15 pb-5">
                <p className="font-bold">{receivedRegistrations.length} {receivedRegistrations.length === 1 ? "pessoa inscrita" : "pessoas inscritas"}</p>
                <p className="text-sm text-[#052B47]/70">{isEventReadyForRegistration(registrationsEvent) ? `${registrationsEvent.availableSpots} vagas ainda disponíveis` : "Vagas a definir"}</p>
              </div>
              {loadingRegistrations ? (
                <div className="py-12 text-center text-[#052B47]/70">Carregando inscrições…</div>
              ) : receivedRegistrations.length ? (
                <ul className="grid gap-4">
                  {receivedRegistrations.map((registration) => (
                    <li key={registration.id} className="grid gap-4 rounded-2xl border border-[#052B47]/15 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="min-w-0">
                        <h3 className="text-lg font-black">{registration.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-[#007F68]">{registration.organization} · {registration.role}</p>
                        <a href={`mailto:${registration.email}`} className="mt-3 inline-block break-all text-sm font-bold text-[#007F68] underline underline-offset-2">{registration.email}</a>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <p className="text-xs font-semibold text-[#052B47]/65 sm:text-right">Inscrição em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(registration.createdAt))}</p>
                        <Button variant="outline" size="sm" onClick={() => setRegistrationToDelete(registration)} className="border-[#B42318]/40 text-[#B42318] hover:border-[#B42318] hover:bg-[#B42318]/10 hover:text-[#B42318]"><Trash2 className="size-4" />Excluir inscrição</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#052B47]/25 px-6 py-12 text-center">
                  <ClipboardList className="mx-auto size-8 text-[#00A180]" />
                  <h3 className="mt-3 text-xl font-black">Ainda não há inscrições</h3>
                  <p className="mt-1 text-[#052B47]/75">As novas inscrições aparecerão aqui automaticamente.</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={Boolean(registrationEvent)} onOpenChange={(open) => { if (!open) { setRegistrationEvent(null); setRegistrationOrganization(""); setIncludeSecondParticipant(false); } }}>
        {registrationEvent && (
          <DialogContent className={`${dialogCloseButtonClass} max-w-xl rounded-[22px] border-[#052B47]/20 p-6 sm:p-8`}>
            <DialogHeader><p className="text-sm font-extrabold text-[#007F68]">{registrationEvent.organization}</p><DialogTitle className="text-2xl font-black tracking-normal">Interesse em participar</DialogTitle><DialogDescription className="text-base leading-relaxed">{registrationEvent.title}</DialogDescription></DialogHeader>
            <form onSubmit={submitRegistration} className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-[#052B47] sm:col-span-2">
                <span>Organização <span className="text-[#B42318]" aria-hidden="true">*</span></span>
                <Select value={registrationOrganization} onValueChange={(value) => setRegistrationOrganization(value ?? "")}>
                  <SelectTrigger aria-label="Organização da inscrição" className="h-11 w-full rounded-xl border-[#052B47]/20 bg-white px-3.5 text-base font-normal shadow-none"><SelectValue placeholder="Selecione sua organização" /></SelectTrigger>
                  <SelectContent>{CORE_ORGANIZATIONS.map((organization) => <SelectItem key={organization} value={organization}>{organization}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <Field label="Nome completo" name="name" className="sm:col-span-2" /><Field label="E-mail" name="email" type="email" autoComplete="off" /><Field label="Cargo ou função" name="role" />
              {includeSecondParticipant ? <div className="grid gap-4 rounded-xl border border-[#052B47]/15 bg-[#E8F3EF] p-4 sm:col-span-2 sm:grid-cols-2">
                <div className="flex items-center justify-between sm:col-span-2"><p className="text-sm font-black">Segunda pessoa</p><Button type="button" variant="ghost" size="sm" onClick={() => setIncludeSecondParticipant(false)} className="text-[#B42318]">Remover</Button></div>
                <Field label="Nome completo" name="secondName" className="sm:col-span-2" /><Field label="E-mail" name="secondEmail" type="email" autoComplete="off" /><Field label="Cargo ou função" name="secondRole" />
              </div> : registrationEvent.availableSpots > 1 ? <Button type="button" variant="outline" onClick={() => setIncludeSecondParticipant(true)} className="w-fit rounded-full border-[#052B47]/30 font-bold sm:col-span-2">Adicionar mais uma pessoa</Button> : <p className="text-sm text-[#052B47]/75 sm:col-span-2">Há apenas uma vaga disponível nesta atividade.</p>}
              <p className="text-xs leading-relaxed text-[#052B47] sm:col-span-2">Os dados e e-mails informados serão compartilhados com a organização anfitriã para organizar a participação.</p>
              <DialogFooter className="mt-1 sm:col-span-2"><Button type="submit" disabled={submitting} className="h-11 rounded-full bg-[#052B47] px-6 font-extrabold text-white hover:bg-[#007F68]">{submitting ? "Confirmando…" : includeSecondParticipant ? "Confirmar duas inscrições" : "Confirmar inscrição"}</Button></DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={publishOpen} onOpenChange={handlePublishOpenChange}>
        <DialogContent className={`${dialogCloseButtonClass} max-h-[94vh] w-[calc(100%-1.5rem)] overflow-x-hidden overflow-y-auto rounded-[22px] border-[#052B47]/20 p-0 sm:max-w-4xl`}>
          <div className="px-6 py-7 pr-14 transition-colors sm:px-8" style={{ backgroundColor: getOrganizationBrand(publishOrganization).color, color: getOrganizationBrand(publishOrganization).foreground }}><DialogHeader><DialogTitle className="text-2xl font-black tracking-normal sm:text-3xl">{editingEvent ? "Editar agenda" : "Compartilhar uma agenda"}</DialogTitle><DialogDescription className="text-base" style={{ color: getOrganizationBrand(publishOrganization).foreground }}>{editingEvent ? "Atualize as informações necessárias e salve as alterações." : "Conte o que torna esse momento relevante e reúna as informações de que cada pessoa precisa para se organizar."}</DialogDescription></DialogHeader></div>
          <form key={editingEvent?.id ?? "new-event"} onSubmit={submitEvent} className="grid min-w-0 gap-6 px-5 pb-8 sm:px-8">
            <p className="text-sm text-[#052B47]/75"><span className="font-bold text-[#B42318]">*</span> Campos obrigatórios</p>
            <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field label="Título" name="title" defaultValue={editingEvent?.title} className="sm:col-span-2" />
              <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-[#052B47] sm:col-span-2">
                <span>Organização anfitriã <span className="text-[#B42318]" aria-hidden="true">*</span></span>
                  <Select value={publishOrganization}  onValueChange={(value) => setPublishOrganization(value ?? "")}>
                  <SelectTrigger aria-label="Organização anfitriã" className="h-11 w-full min-w-0 rounded-xl border-[#052B47]/20 bg-white px-3.5 text-base font-normal shadow-none">
                    <SelectValue placeholder="Selecione uma organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {CORE_ORGANIZATIONS.map((organization) => (
                      <SelectItem key={organization} value={organization}>
                        <span className="flex items-center gap-2.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: getOrganizationBrand(organization).color }} />{organization}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <TextArea label="O que será vivenciado" name="description" defaultValue={editingEvent?.description} className="sm:col-span-2" placeholder="Apresente o objetivo, as principais atividades e o que as pessoas participantes poderão conhecer." />
            </fieldset>
            <fieldset className="grid min-w-0 gap-4 border-t border-[#052B47]/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Data de início" name="startDate" type="date" defaultValue={editingEvent?.startDate} required={!editingEvent || isEventReadyForRegistration(editingEvent)} />
              <Field label="Horário de início" name="startTime" type="time" defaultValue={editingEvent?.startTime} required={!editingEvent || isEventReadyForRegistration(editingEvent)} />
              <Field label="Data de término" name="endDate" type="date" defaultValue={editingEvent?.endDate} required={!editingEvent || isEventReadyForRegistration(editingEvent)} />
              <Field label="Horário de término" name="endTime" type="time" defaultValue={editingEvent?.endTime} required={!editingEvent || isEventReadyForRegistration(editingEvent)} />
              <Field label="Prazo máximo de inscrição" name="registrationDeadline" type="date" defaultValue={editingEvent?.registrationDeadline} required={!editingEvent || isEventReadyForRegistration(editingEvent)} className="lg:col-span-2" />
              <Field label="Total de vagas" name="maxParticipants" type="number" min="1" max="200" defaultValue={editingEvent?.maxParticipants || ""} required={!editingEvent || isEventReadyForRegistration(editingEvent)} className="lg:col-span-2" />
            </fieldset>
            <fieldset className="grid min-w-0 gap-4 border-t border-[#052B47]/15 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Cidade" name="city" defaultValue={editingEvent?.city} required={!editingEvent || isEventReadyForRegistration(editingEvent)} />
              <Field label="UF" name="state" max="2" defaultValue={editingEvent?.state} />
              <Field label="Local" name="venue" defaultValue={editingEvent?.venue} required={false} />
            </fieldset>
            <fieldset className="grid min-w-0 gap-4 border-t border-[#052B47]/15 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <TextArea label="Transporte durante a atividade" name="transport" defaultValue={editingEvent?.transport} required={false} maxLength={400} placeholder="Explique se haverá deslocamentos locais e como eles serão organizados." />
              <TextArea label="Hospedagem" name="accommodation" defaultValue={editingEvent?.accommodation} required={false} maxLength={400} placeholder="Informe se haverá hospedagem, quais noites estão previstas e como ela será organizada." />
              <TextArea label="Alimentação" name="meals" defaultValue={editingEvent?.meals} required={false} maxLength={400} placeholder="Informe se há ou não refeições incluídas e em quais momentos da agenda." />
              <TextArea label="Observações adicionais" name="additionalNotes" defaultValue={editingEvent?.additionalNotes} required={false} className="sm:col-span-2 lg:col-span-3" placeholder="Compartilhe orientações importantes que não estejam contempladas nos itens anteriores." />
            </fieldset>
            <fieldset className="grid min-w-0 gap-4 border-t border-[#052B47]/15 pt-6 sm:grid-cols-2"><Field label="Pessoa de contato" name="contactName" defaultValue={editingEvent?.contactName} /><Field label="E-mail" name="contactEmail" type="email" defaultValue={editingEvent?.contactEmail} /></fieldset>
            <DialogFooter><Button type="submit" disabled={submitting} className="h-12 rounded-full bg-[#052B47] px-7 font-extrabold text-white hover:bg-[#007F68]">{submitting ? (editingEvent ? "Salvando…" : "Publicando…") : (editingEvent ? "Salvar alterações" : "Publicar agenda")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={usersOpen} onOpenChange={setUsersOpen}>
        <DialogContent className={`${dialogCloseButtonClass} max-h-[94vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-[22px] border-[#052B47]/20 p-0 sm:max-w-2xl`}>
          <div className="bg-[#052B47] px-6 py-7 pr-14 text-white sm:px-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Administradores</DialogTitle>
              <DialogDescription className="text-base text-white">Conceda ou remova o perfil de administrador da agenda.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-6 px-5 pb-8 sm:px-8">
            <p className="rounded-xl bg-[#E8F3EF] px-4 py-3 text-sm leading-relaxed">Adicione quem poderá administrar a agenda. O acesso ao site continua sendo definido no compartilhamento.</p>
            <form onSubmit={submitUserRole} className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail" name="email" type="email" className="sm:col-span-2" />
              <Field label="Nome" name="displayName" required={false} />
              <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={savingUser} className="rounded-full bg-[#052B47] text-white hover:bg-[#007F68]">{savingUser ? "Salvando…" : "Adicionar administrador"}</Button></DialogFooter>
            </form>
            <div className="border-t border-[#052B47]/15 pt-5">
              <h3 className="text-lg font-black">Administradores cadastrados</h3>
              {loadingUsers ? <p className="mt-4 text-sm" role="status">Carregando permissões…</p> : (
                <ul className="mt-4 grid gap-3">
                  {managedUsers.map((managedUser) => (
                    <li key={managedUser.email} className="flex flex-col justify-between gap-3 rounded-xl border border-[#052B47]/15 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0"><p className="font-bold">{managedUser.displayName || managedUser.email}</p><p className="break-all text-sm text-[#052B47]/75">{managedUser.email} · Administrador</p></div>
                      {managedUser.protected ? <span className="text-xs font-bold text-[#052B47]/70">Principal</span> : <Button type="button" variant="outline" size="sm" disabled={savingUser} onClick={() => void deleteUserRole(managedUser.email)} className="border-[#B42318]/40 text-[#B42318] hover:bg-[#B42318]/10"><Trash2 className="size-4" />Remover</Button>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(registrationToDelete)} onOpenChange={(open) => !open && setRegistrationToDelete(null)}>
        <AlertDialogContent className="rounded-[22px] border-[#052B47]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-[#052B47]">Excluir esta inscrição?</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed text-[#052B47]/75">
              {registrationToDelete?.name} deixará de constar na lista de participantes e a vaga voltará a ficar disponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRegistration} className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deletingRegistration} onClick={() => void deleteRegistration()} className="rounded-full bg-[#B42318] text-white hover:bg-[#8F1C13]">{deletingRegistration ? "Excluindo…" : "Excluir inscrição"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={Boolean(eventToDelete)} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent className="rounded-[22px] border-[#052B47]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-[#052B47]">Excluir esta atividade?</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed text-[#052B47]/75">
              {eventToDelete?.isDemo
                ? `O exemplo “${eventToDelete.title}” será removido da agenda.`
                : `A atividade “${eventToDelete?.title}” e todas as suas inscrições serão excluídas permanentemente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingEvent} className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deletingEvent} onClick={() => void deleteEvent()} className="rounded-full bg-[#B42318] text-white hover:bg-[#8F1C13]">{deletingEvent ? "Excluindo…" : "Excluir atividade"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster richColors position="bottom-right" />
    </main>
  );
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}
