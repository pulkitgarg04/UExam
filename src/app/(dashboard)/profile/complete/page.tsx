"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, GraduationCap, BookOpen, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TeacherProfileForm } from "@/components/profile/TeacherProfileForm"
import { StudentProfileForm } from "@/components/profile/StudentProfileForm"

export default function CompleteProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileProgress, setProfileProgress] = useState(0)
  const router = useRouter()

useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }

        const data = await response.json()
        setUser(data.user)

        if (data.user.profileCompleted) {
          if (data.user.role === "TEACHER") {
            router.push("/teacher")
          } else if (data.user.role === "STUDENT") {
            router.push("/student")
          } else {
            router.push("/admin")
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleProfileComplete = () => {
    const updatedUser = { ...user, profileCompleted: true }
    setUser(updatedUser)
    fetch("/api/auth/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileCompleted: true }),
    })

    if (user.role === "TEACHER") {
      router.push("/teacher")
    } else if (user.role === "STUDENT") {
      router.push("/student")
    } else {
      router.push("/admin")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UExam
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Profile Setup</Badge>
              <Badge variant={user.role === "TEACHER" ? "default" : "outline"}>{user.role}</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {user.role === "TEACHER" ? (
              <BookOpen className="w-16 h-16 text-blue-600" />
            ) : (
              <User className="w-16 h-16 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {user.role === "TEACHER"
              ? "Please provide your academic and professional details to access the teacher portal and create comprehensive tests."
              : "Please complete your student profile to access the student portal and take tests."}
          </p>
        </div>

        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Profile Completion Required:</strong> You need to complete your profile before accessing the{" "}
                {user.role.toLowerCase()} portal.
              </span>
              <Badge variant="outline" className="ml-4">
                {profileProgress}% Complete
              </Badge>
            </div>
            <Progress value={profileProgress} className="mt-2 h-2" />
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user.role === "TEACHER" ? (
                <>
                  <BookOpen className="w-5 h-5" />
                  Teacher Profile Information
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Student Profile Information
                </>
              )}
            </CardTitle>
            <CardDescription>
              {user.role === "TEACHER"
                ? "Provide your academic credentials, professional experience, and teaching details."
                : "Fill in your academic records, contact information, and personal details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === "TEACHER" ? (
              <TeacherProfileForm
                user={user}
                onComplete={handleProfileComplete}
                onProgressUpdate={setProfileProgress}
              />
            ) : (
              <StudentProfileForm
                user={user}
                onComplete={handleProfileComplete}
                onProgressUpdate={setProfileProgress}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                After Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                {user.role === "TEACHER" ? (
                  <>
                    <li>• Create and manage comprehensive tests</li>
                    <li>• Access advanced analytics and reporting</li>
                    <li>• Manage student enrollments and progress</li>
                    <li>• Use proctoring and security features</li>
                    <li>• Export academic records and certificates</li>
                  </>
                ) : (
                  <>
                    <li>• Take tests and assessments</li>
                    <li>• View detailed performance analytics</li>
                    <li>• Access study materials and resources</li>
                    <li>• Track academic progress over time</li>
                    <li>• Receive personalized recommendations</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• All fields marked with * are mandatory</li>
                <li>• You can update your profile later from settings</li>
                <li>• Ensure all information is accurate and up-to-date</li>
                <li>• Profile photos should be professional and clear</li>
                <li>• Contact information will be used for important notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}