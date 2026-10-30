import { formatEventDateRange, formatEventTimeRange } from "./event-rules.ts";

export type RegistrationEmailEvent = {
  title: string;
  type: string;
  organization: string;
  contactName: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  state: string;
};

export type RegistrationEmailParticipant = {
  name: string;
  email: string;
  organization: string;
  role: string;
};

function registrationDetails(event: RegistrationEmailEvent, participant: RegistrationEmailParticipant) {
  return {
    eventFormat: event.type,
    eventTitle: event.title,
    eventDate: `${formatEventDateRange(event.startDate, event.endDate)} · ${formatEventTimeRange(event.startTime, event.endTime)}`,
    eventLocation: [event.venue, `${event.city} - ${event.state}`].filter(Boolean).join(", "),
    participantName: participant.name,
    participantEmail: participant.email,
    participantOrganization: participant.organization,
    participantRole: participant.role,
  };
}

export function hostNotification(event: RegistrationEmailEvent, participant: RegistrationEmailParticipant) {
  return {
    contactName: event.contactName,
    contactEmail: event.contactEmail,
    ...registrationDetails(event, participant),
  };
}

export function participantConfirmation(event: RegistrationEmailEvent, participant: RegistrationEmailParticipant) {
  const details = registrationDetails(event, participant);
  const text = [
    `Olá, ${participant.name}!`,
    "",
    `Sua inscrição em “${event.title}” foi recebida.`,
    `Data e horário: ${details.eventDate}`,
    `Local: ${details.eventLocation}`,
    `Organização anfitriã: ${event.organization}`,
    "",
    `Em caso de dúvidas, fale com ${event.contactName} pelo e-mail ${event.contactEmail}.`,
  ].join("\n");
  return {
    // The existing webhook addresses mail to contactEmail. Keep that field for
    // compatibility and include explicit recipient/content for richer relays.
    contactName: participant.name,
    contactEmail: participant.email,
    ...details,
    notificationType: "participant_confirmation",
    recipientEmail: participant.email,
    replyToEmail: event.contactEmail,
    subject: `Inscrição recebida: ${event.title}`,
    text,
  };
}
