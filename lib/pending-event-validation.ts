import { z } from "zod";
import { eventSchema } from "./event-validation.ts";

const optionalDate = z.union([z.string().date(), z.literal("")]);
const optionalTime = z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), z.literal("")]);

// An existing event can be saved while logistical details are still being confirmed.
export const pendingEventSchema = eventSchema.extend({
  description: z.string().trim().min(1).max(900),
  startDate: optionalDate,
  endDate: optionalDate,
  startTime: optionalTime,
  endTime: optionalTime,
  registrationDeadline: optionalDate,
  city: z.string().trim().max(80),
  maxParticipants: z.coerce.number().int().min(0).max(200),
});
