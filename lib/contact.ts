import { cleanLine, cleanText } from "./text";

export const CONTACT_LIMITS = { name: 80, email: 254, message: 2000 } as const;

type Field = keyof typeof CONTACT_LIMITS;
type ContactInput = Record<Field, string>;
export type ContactResult = { ok: true; value: ContactInput } | { ok: false; errors: Partial<Record<Field, string>> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(body: unknown): ContactResult {
  const source = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const value = {
    name: cleanLine(source.name),
    email: cleanLine(source.email),
    message: cleanText(source.message),
  };
  const errors: Partial<Record<Field, string>> = {};

  if (!value.name) errors.name = "Add your name.";
  else if (value.name.length > CONTACT_LIMITS.name) errors.name = `Keep your name under ${CONTACT_LIMITS.name} characters.`;

  if (!EMAIL.test(value.email) || value.email.length > CONTACT_LIMITS.email) errors.email = "Add an email address I can reply to.";

  if (!value.message) errors.message = "Write a message.";
  else if (value.message.length > CONTACT_LIMITS.message)
    errors.message = `Keep it under ${CONTACT_LIMITS.message.toLocaleString("en")} characters.`;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
