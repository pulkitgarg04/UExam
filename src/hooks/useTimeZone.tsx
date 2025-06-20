"use client"

import { useEffect, useState } from "react"

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>("")
  const [offset, setOffset] = useState<string>("")

  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const offsetMinutes = now.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
    const offsetMins = Math.abs(offsetMinutes) % 60
    const offsetSign = offsetMinutes <= 0 ? "+" : "-"
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`

    setTimezone(userTimezone)
    setOffset(offsetString)
  }, [])

  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      ...options,
    })
  }

  const formatTime = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    })
  }

  const formatDateTime = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    })
  }

  const isTestAvailable = (testDate: string, duration = 60) => {
    const now = new Date()
    const testTime = new Date(testDate)
    const testEndTime = new Date(testTime.getTime() + duration * 60 * 1000)
    const timeDiff = testTime.getTime() - now.getTime()

    // Available 30 minutes before test time
    const thirtyMinsBefore = 30 * 60 * 1000

    return {
      available: timeDiff <= thirtyMinsBefore && now < testEndTime,
      timeUntilAvailable: timeDiff > thirtyMinsBefore ? timeDiff - thirtyMinsBefore : 0,
      timeUntilStart: timeDiff > 0 ? timeDiff : 0,
      hasEnded: now > testEndTime,
    }
  }

  return {
    timezone,
    offset,
    formatDate,
    formatTime,
    formatDateTime,
    isTestAvailable,
  }
}