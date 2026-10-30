import { z } from "zod";
import { BRAZILIAN_STATES } from "./event-rules.ts";
import { CORE_ORGANIZATIONS } from "./organization-brand.ts";

export const eventSchema = z.object({
  title: z.string().trim().min(4).max(120),
  organization: z.enum(CORE_ORGANIZATIONS),
  description: z.string().trim().min(20).max(900),
  startDate: z.string().date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endDate: z.string().date(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  registrationDeadline: z.string().date(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().toUpperCase().pipe(z.enum(BRAZILIAN_STATES)),
  venue: z.string().trim().max(160).default(""),
  transport: z.string().trim().max(400).default(""),
  accommodation: z.string().trim().max(400).default(""),
  meals: z.string().trim().max(400).default(""),
  dressCode: z.string().trim().max(240).optional(),
  additionalNotes: z.string().trim().max(800).default(""),
  contactName: z.string().trim().min(2).max(100),
  contactEmail: z.string().trim().email().max(160),
  maxParticipants: z.coerce.number().int().min(1).max(200),
});

const fieldLabels: Record<string, string> = {
  title: "Título",
  organization: "Organização anfitriã",
  description: "O que será vivenciado",
  startDate: "Data de início",
  startTime: "Horário de início",
  endDate: "Data de término",
  endTime: "Horário de término",
  registrationDeadline: "Prazo máximo de inscrição",
  city: "Cidade",
  state: "UF",
  venue: "Local",
  transport: "Transporte durante a atividade",
  accommodation: "Hospedagem",
  meals: "Alimentação",
  contactName: "Pessoa de contato",
  contactEmail: "E-mail de contato",
  maxParticipants: "Total de vagas",
};

export function eventValidationMessage(error: z.ZodError) {
  const fields = [...new Set(error.issues.map((issue) => fieldLabels[String(issue.path[0])] ?? String(issue.path[0])))];
  return `Revise os seguintes campos: ${fields.join(", ")}.`;
}
