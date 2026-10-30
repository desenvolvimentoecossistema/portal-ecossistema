import { z } from "zod";
import { CORE_ORGANIZATIONS } from "./organization-brand.ts";

const participantSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email().max(160),
  role: z.string().trim().min(2).max(100),
});

export const registrationSchema = z.object({
  eventId: z.string().min(1),
  organization: z.enum(CORE_ORGANIZATIONS),
  participants: z.array(participantSchema).min(1).max(2),
}).superRefine(({ participants }, context) => {
  if (participants.length === 2 && participants[0].email === participants[1].email) {
    context.addIssue({ code: "custom", path: ["participants", 1, "email"], message: "Informe e-mails diferentes para as duas pessoas." });
  }
});

type Participant = z.infer<typeof participantSchema>;

// A single INSERT statement makes the two registrations all-or-nothing, including
// the checks for capacity, organization quota and existing email addresses.
export function registrationInsert(participants: Participant[], eventId: string, organization: string, today: string, createdAt: string) {
  const candidates = participants.map(() => "(?, ?, ?, ?)").join(", ");
  const sql = `
    WITH candidate(id, name, email, role) AS (VALUES ${candidates})
    INSERT INTO registrations
      (id, event_id, name, email, organization, role, accessibility_needs, created_at)
    SELECT candidate.id, ?, candidate.name, candidate.email, ?, candidate.role, '', ?
    FROM candidate
    WHERE EXISTS (
      SELECT 1 FROM events AS event
      WHERE event.id = ? AND event.registration_deadline >= ?
        AND (SELECT count(*) FROM registrations AS entry WHERE entry.event_id = event.id) + ? <= event.max_participants
        AND (SELECT count(*) FROM registrations AS organization_entry
          WHERE organization_entry.event_id = event.id
            AND lower(trim(organization_entry.organization)) = lower(trim(?))) + ? <= 2
    )
    AND NOT EXISTS (
      SELECT 1 FROM registrations AS duplicate
      JOIN candidate AS proposed ON duplicate.email = proposed.email
      WHERE duplicate.event_id = ?
    )
  `;
  const values = [
    ...participants.flatMap((participant) => [crypto.randomUUID(), participant.name, participant.email, participant.role]),
    eventId, organization, createdAt, eventId, today, participants.length, organization, participants.length, eventId,
  ];
  return { sql, values };
}
