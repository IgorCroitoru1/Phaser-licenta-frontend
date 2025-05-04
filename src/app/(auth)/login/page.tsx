import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
// import { UserAuthForm } from "@/components/user-auth-form"
import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login cu contul tau",
}

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Inapoi
        </>
      </Link>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-16 md:left-8 md:top-16"
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Register
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Salut
          </h1>
          <p className="text-sm text-muted-foreground">
            Introdu adresa ta de email pentru a te autentifica în contul tău
          </p>
        </div>
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Nu ai un cont? Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  )
}