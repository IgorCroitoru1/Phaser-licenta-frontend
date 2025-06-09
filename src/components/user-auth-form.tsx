"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button as CustomButton } from "@/components/ui/custom_button";
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/custom-input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { userAuthSchema } from "@/lib/validations/auth"
import { NEXT_PUBLIC_AUTH_SERVER_URL } from "../../config"
import api from "@/lib/axios"
import { authService } from "@/services/auth"
import { useRouter } from "next/navigation"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isRegister?: boolean
}

type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm({ className, isRegister = false, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isCodeSent, setIsCodeSent] = React.useState<boolean>(false)
  const [isSendingCode, setIsSendingCode] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const searchParams = useSearchParams()
  
  const email = watch('email')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const verificationCode = watch('verificationCode')
  const fullName = watch('fullName')

  // Check if passwords match
  const passwordsMatch = password === confirmPassword
  
  // Check if all fields are valid for registration
  const canRegister = email && password && confirmPassword && passwordsMatch && verificationCode && fullName && isCodeSent
  
  const handleSendCode = async () => {
    // Validate email using Zod before making the request
    try {
      // Extract just the email validation from your schema
      const emailSchema = userAuthSchema.pick({ email: true })
      const validatedData = emailSchema.parse({ email })
      
      setIsSendingCode(true)
      setError(null)
      setFieldErrors({})

      await authService.sendCode(validatedData.email)
      setIsCodeSent(true)
      setError(null)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors
        const emailError = err.errors.find(e => e.path.includes('email'))
        setError(emailError?.message || "Email invalid")
        return
      }
      
      if (err?.response?.data?.errors) {
        // Handle validation errors from backend
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || "Eroare de validare");
      } else {
        // Handle general errors
        setError(err instanceof Error ? err.message : "Eroare la trimiterea codului")
      }
    } finally {
      setIsSendingCode(false)
    }
  };

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      if (isRegister) {
        if (data.password !== data.confirmPassword) {
          throw new Error("Parolele nu se potrivesc")
        }

        if (!isCodeSent) {
          throw new Error("Te rog trimite codul de verificare mai întâi")
        }

        if (!data.verificationCode) {
          throw new Error("Te rog introduceți codul de verificare")
        }

        // Handle registration logic
        await authService.register({
          fullName: data.fullName!,
          email: data.email,
          password: data.password,
          verificationCode: data.verificationCode!,
        })
        
        router.push("/login?message=registered")
      } else {
        // Handle login logic
        await authService.login({
          email: data.email,
          password: data.password,
        })
        router.push(searchParams?.get("from") || "/")
      }
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        // Handle validation errors from backend
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || "Eroare de validare");
      } else {
        // Handle general errors
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {isRegister && (
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nume complet</Label>
              <Input
                id="fullName"
                placeholder="Numele și prenumele dvs."
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                disabled={isLoading}
                {...register("fullName", {
                  required: isRegister ? "Numele este obligatoriu" : false
                })}
              />
              {/* Show React Hook Form validation errors */}
              {errors?.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
              {/* Show backend validation errors */}
              {fieldErrors.fullName && (
                <div className="space-y-1">
                  {fieldErrors.fullName.map((errorMsg, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {errorMsg}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {/* Show React Hook Form validation errors */}
            {errors?.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
            {/* Show backend validation errors */}
            {fieldErrors.email && (
              <div className="space-y-1">
                {fieldErrors.email.map((errorMsg, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {errorMsg}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              placeholder={isRegister ? "Alege o parola" : "Parola ta"}
              type="password"
              autoCapitalize="none"
              autoComplete={isRegister ? "new-password" : "current-password"}
              disabled={isLoading}
              {...register("password")}
            />
            {/* Show React Hook Form validation errors */}
            {errors?.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
            {/* Show backend validation errors */}
            {fieldErrors.password && (
              <div className="space-y-1">
                {fieldErrors.password.map((errorMsg, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {errorMsg}
                  </p>
                ))}
              </div>
            )}
          </div>

          {isRegister && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirma Parola</Label>
                <Input
                  id="confirmPassword"
                  placeholder="Confirma parola"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("confirmPassword", {
                    validate: (value) => 
                      value === password || "Parolele nu se potrivesc",
                  })}
                />
                {/* Show React Hook Form validation errors */}
                {errors?.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
                {/* Show backend validation errors */}
                {fieldErrors.confirmPassword && (
                  <div className="space-y-1">
                    {fieldErrors.confirmPassword.map((errorMsg, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {errorMsg}
                      </p>
                    ))}
                  </div>
                )}
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">
                    Parolele nu se potrivesc
                  </p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-sm text-green-600">
                    ✓ Parolele se potrivesc
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="verificationCode">Cod de verificare</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="verificationCode"
                    placeholder="Cod de verificare"
                    type="text"
                    disabled={isLoading || !isCodeSent}
                    {...register("verificationCode")}
                  />
                  <CustomButton
                    type="button"
                    disabled={isLoading || isSendingCode || !email || isCodeSent}
                    className="px-4 py-2 bg-primary text-white rounded-md whitespace-nowrap"
                    onClick={handleSendCode}
                  >
                    {isSendingCode && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isCodeSent ? "Trimis ✓" : "Trimite"}
                  </CustomButton>
                </div>
                {isCodeSent && (
                  <p className="text-sm text-green-600">
                    ✓ Codul de verificare a fost trimis la {email}
                  </p>
                )}
                {/* Show React Hook Form validation errors */}
                {errors?.verificationCode && (
                  <p className="text-sm text-destructive">
                    {errors.verificationCode.message}
                  </p>
                )}
                {/* Show backend validation errors */}
                {fieldErrors.verificationCode && (
                  <div className="space-y-1">
                    {fieldErrors.verificationCode.map((errorMsg, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {errorMsg}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* General error message */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            className={cn(buttonVariants(), "mt-2")} 
            disabled={isLoading || (isRegister && !canRegister)}
            type="submit"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isRegister ? "Creează Cont" : "Autentificare"}
          </button>
          
          {isRegister && !canRegister && !isLoading && (
            <div className="text-sm text-muted-foreground mt-2">
              {!fullName && "• Completați numele"}
              {!email && "• Completați email-ul"}
              {!password && "• Completați parola"}
              {!confirmPassword && "• Confirmați parola"}
              {password && confirmPassword && !passwordsMatch && "• Parolele nu se potrivesc"}
              {!isCodeSent && "• Trimiteți codul de verificare"}
              {!verificationCode && isCodeSent && "• Introduceți codul de verificare"}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}