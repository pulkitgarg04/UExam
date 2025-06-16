"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "STUDENT" | "TEACHER"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { loading, requireAuth } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!requireAuth(requiredRole)) {
    return null
  }

  return <>{children}</>
}