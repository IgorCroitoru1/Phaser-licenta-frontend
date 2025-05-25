import * as z from "zod"

export const channelCreationSchema = z.object({
  name: z.string().min(1, "Numele canalului este obligatoriu").max(30, "Numele canalului nu poate depăși 50 de caractere"),
  maxUsers: z.number().min(1, "Numărul minim de utilizatori este 1").max(100, "Numărul maxim de utilizatori este 100"),
  mapName: z.string().min(1, "Selectarea unei hărți este obligatorie"),
})

export type ChannelCreationFormData = z.infer<typeof channelCreationSchema>
