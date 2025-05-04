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
import { Input } from "@/components/ui/input"
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
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const searchParams = useSearchParams()

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      if (isRegister) {
        // Handle registration logic
        // if (data.password !== data.confirmPassword) {
        //   throw new Error("Parolele nu se potrivesc")
        // }

        // // Add your registration API call here
        // const response = await api.post(NEXT_PUBLIC_AUTH_SERVER_URL + "/auth/register", {
        //   body: JSON.stringify({
        //     email: data.email,
        //     password: data.password
        //   })
        // })

        // if (!response.ok) {
        //   const errorData = await response.json()
        //   throw new Error(errorData.message || 'Registration failed')
        // }

     
      } else {
        // Handle login logic
        await authService.login({
          email: data.email,
          password: data.password,
        })
        router.push(searchParams?.get("from") || "/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
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
            {errors?.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
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
            {errors?.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
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
                      value === watch('password') || "Pariolele nu se potrivesc",
                  })}
                />
                {errors?.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="verificationCode"
                  placeholder="Cod de verificare"
                  type="text"
                  disabled={isLoading}
                  {...register("verificationCode")}
                />
                <CustomButton
                  // type="button"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                  onClick={() => {
                    // TODO: handle sending the code
                    console.log("Send Code")
                  }}
                >
                  Trimite
                </CustomButton>
              </div>
            </>
          )}

          <button 
            className={cn(buttonVariants(), "mt-2")} 
            disabled={isLoading}
            type="submit"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isRegister ? "Creează Cont" : "Autentificare"}
          </button>
        </div>
      </form>
    </div>
  )
}