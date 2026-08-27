import { z } from "zod";

/**
 * Schemas de validação de entrada do usuário.
 * Hoje só o e-mail do formulário de acesso (src/sections/Cta.tsx).
 */

export const accessEmailSchema = z.email();

export type AccessEmail = z.infer<typeof accessEmailSchema>;

export function parseAccessEmail(raw: string) {
  return accessEmailSchema.safeParse(raw);
}
