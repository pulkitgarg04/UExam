"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  User,
  BarChart3,
  AlertCircle,
  FileText,
} from "lucide-react"
import Link from "next/link"
import axios from "axios"

export interface Student {
  id: string
  name: string
  email: string
  studentProfile: {
    rollNumber: string
    department: string
    yearOfStudy: number
    courseName: string
  }
  createdAt: string
  updatedAt: string
}

interface AvailableTest {
  id: string
  title: string
  subject: string
  testLink: string
  department: string
  degree: string
  studentYear: string
  date: string
  duration: number
  totalMarks: number
  creator: {
    name: string
    teacherProfile: {
      designation: string
    }
  }
}

interface CompletedTest {
  id: string
  marksObtained: number
  totalMarks: number
  submittedAt: string
  test: {
    title: string
    subject: string
    duration: number
  }
}

export default function StudentPortalContent() {
  const [student, setStudent] = useState<Student | null>(null)
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([])
  const [completedTests, setCompletedTests] = useState<CompletedTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await axios.get("/api/data/student", {
        withCredentials: true,
      })

      const { student, availableTests, completedTests } = data

      setStudent(student)
      setAvailableTests(availableTests || [])
      setCompletedTests(completedTests || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  const getTestStatus = (testDate: string, duration: number) => {
    const now = new Date()
    const testTime = new Date(testDate)
    const testEndTime = new Date(testTime.getTime() + duration * 60 * 1000)
    const timeDiff = testTime.getTime() - now.getTime()

    if (timeDiff > 30 * 60 * 1000) {
      const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      return {
        status: "upcoming",
        message: `Available in ${hoursUntil}h ${minutesUntil}m`,
        available: false,
      }
    } else if (timeDiff <= 30 * 60 * 1000 && now < testEndTime) {
      return {
        status: "available",
        message: "Available Now",
        available: true,
      }
    } else if (now > testEndTime) {
      return {
        status: "ended",
        message: "Test Ended",
        available: false,
      }
    } else {
      return {
        status: "unavailable",
        message: "Not Available",
        available: false,
      }
    }
  }

  const getYearSuffix = (year: number) => {
    if (year === 1) return "1st Year"
    if (year === 2) return "2nd Year"
    if (year === 3) return "3rd Year"
    return `${year}th Year`
  }

  const averageScore =
    completedTests.length > 0
      ? Math.round(
          completedTests.reduce((acc, test) => acc + (test.marksObtained / test.totalMarks) * 100, 0) /
            completedTests.length,
        )
      : 0

  const totalMarksEarned = completedTests.reduce((acc, test) => acc + test.marksObtained, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UExam
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Student Portal</Badge>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{student?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {student?.name}!</h1>
          <p className="text-gray-600">
            {student?.studentProfile?.rollNumber} • {student?.studentProfile?.department} •{" "}
            {getYearSuffix(student?.studentProfile?.yearOfStudy || 1)}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableTests.length}</div>
              <p className="text-xs text-muted-foreground">
                {availableTests.length > 0 ? "Tests to take" : "No upcoming tests"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTests.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMarksEarned}</div>
              <p className="text-xs text-muted-foreground">Marks earned</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Available Tests
                </CardTitle>
                <CardDescription>Tests available for your department and year</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableTests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tests available at the moment</p>
                  </div>
                ) : (
                  availableTests.map((test) => {
                    const testStatus = getTestStatus(test.date, test.duration)
                    const dateTime = formatDateTime(test.date)

                    return (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{test.title}</h3>
                          <p className="text-sm text-gray-600">{test.subject}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            By {test.creator.name} • {test.creator.teacherProfile.designation}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {dateTime.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dateTime.time}
                            </span>
                            <span>{test.duration} min</span>
                            <span>{test.totalMarks} marks</span>
                            <Badge variant="outline" className="text-xs">
                              {dateTime.timezone}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {test.degree}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {test.studentYear}
                            </Badge>
                            <Badge
                              variant={testStatus.status === "available" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {testStatus.message}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {testStatus.available ? (
                            <Link href={`/test/${test.testLink}/instructions`}>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Play className="w-4 h-4 mr-2" />
                                Start Test
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" disabled variant="outline">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              {testStatus.message}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Completed Tests
                </CardTitle>
                <CardDescription>Your test results and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedTests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed tests yet</p>
                  </div>
                ) : (
                  completedTests.map((test) => {
                    const percentage = Math.round((test.marksObtained / test.totalMarks) * 100)
                    return (
                      <div key={test.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{test.test.title}</h3>
                            <p className="text-sm text-gray-600">{test.test.subject}</p>
                            <p className="text-xs text-gray-500">Submitted on {formatDate(test.submittedAt)}</p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}
                            >
                              {test.marksObtained}/{test.totalMarks}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>Duration: {test.test.duration} minutes</span>
                          <span className={percentage >= 60 ? "text-green-600" : "text-red-600"}>
                            {percentage >= 60 ? "Passed" : "Failed"}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}