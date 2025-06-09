import * as z from "zod"

export const userAuthSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
  confirmPassword: z.string().optional(),
  verificationCode: z.string().optional(),
  fullName: z.string().min(1, "Numele este obligatoriu").optional(),
})