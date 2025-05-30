'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/custom-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/useAuthStore'
import { Icons } from '@/components/icons'
import { UserDto } from '@/dtos/UserDto'
import { Button } from './ui/custom_button'
import { Input } from './ui/custom-input'
import { userService } from '@/services/user'

const userAccountSchema = z.object({
  name: z.string().min(2, {
    message: "Numele trebuie să aibă cel puțin 2 caractere.",
  }),
  avatar: z.string().url().optional().or(z.literal('')),
})

type UserAccountFormValues = z.infer<typeof userAccountSchema>

interface UserAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserAccountDialog({ open, onOpenChange }: UserAccountDialogProps) {
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  
  const form = useForm<UserAccountFormValues>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      name: '',
      avatar: '',
    },
  })  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        avatar: '', // user.avatar || '',
      })
      setAvatarPreview('') // user.avatar || ''
    }
  }, [user, form])

  // Clear form when dialog closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to ensure proper cleanup after dialog animation
      const timer = setTimeout(() => {
        form.reset()
        setError(null)
        setFieldErrors({})
        setAvatarPreview('')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, form])

  const onSubmit = async (data: UserAccountFormValues) => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      // Call API to update user profile
      const updatedUser = await userService.updateProfile({
        name: data.name,
        avatar: data.avatar || undefined,
      })
      
      // Update the auth store with the new user data
      setUser(updatedUser)
      
      // Reset form and close dialog on success
      form.reset()
      setError(null)
      setFieldErrors({})
      setAvatarPreview('')
      onOpenChange(false)
      
      // TODO: Show success toast
      console.log('Profile updated successfully')
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        // Handle validation errors from backend
        setFieldErrors(error.response.data.errors)
        setError(error.response.data.message || "Eroare de validare")
      } else {
        // Handle general errors
        setError(
          error?.response?.data?.message ||
            "A apărut o eroare la actualizarea profilului"
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
      
      // TODO: Upload file to server and get URL
      // For now, just set the preview URL
      form.setValue('avatar', previewUrl)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview('')
    form.setValue('avatar', '')
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contul meu</DialogTitle>
          <DialogDescription>
            Modifică informațiile contului tău aici. Apasă pe salvează când ai terminat.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={avatarPreview || "https://github.com/shadcn.png"} 
                  alt={user.name}
                />
                <AvatarFallback className="text-lg">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Icons.upload className="w-4 h-4 mr-2" />
                  Schimbă poza
                </Button>
                
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <Icons.trash className="w-4 h-4 mr-2" />
                    Șterge
                  </Button>
                )}
              </div>
              
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Numele tău" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Show backend validation errors */}
                  {fieldErrors.name && (
                    <div className="space-y-1">
                      {fieldErrors.name.map((errorMsg, index) => (
                        <p key={index} className="text-sm text-red-600">
                          {errorMsg}
                        </p>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />{/* Email Field - Read Only */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-muted-foreground">
                Email
              </label>
              <Input 
                placeholder="email@example.com" 
                type="email"
                value={user.email}
                disabled
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Adresa de email nu poate fi modificată
              </p>            </div>

            {/* General error message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Action Buttons */}            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setError(null)
                  setFieldErrors({})
                  setAvatarPreview('')
                  onOpenChange(false)
                }}
                disabled={isLoading}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvează
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
