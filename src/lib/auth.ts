"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "STUDENT" | "TEACHER"
  createdAt: string
  updatedAt: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/auth/login")
  }

  const requireAuth = (requiredRole?: "STUDENT" | "TEACHER") => {
    if (!user) {
      router.push("/auth/login")
      return false
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized")
      return false
    }

    return true
  }

  return {
    user,
    loading,
    logout,
    requireAuth,
    isAuthenticated: !!user,
    isStudent: user?.role === "STUDENT",
    isTeacher: user?.role === "TEACHER",
  }
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(endpoint, config)

  if (response.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/auth/login"
    throw new Error("Unauthorized")
  }

  return response
}