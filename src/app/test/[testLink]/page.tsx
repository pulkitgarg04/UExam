"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  Timer,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { useParams } from "next/navigation"
import { CodeEditor } from "@/components/code/codeEditor"

interface TestCase {
  id: string
  input: string
  expected: string
  isPublic: boolean
}

interface Question {
  id: string
  type: "MCQ" | "CODING"
  question: string
  options?: string[]
  marks: number
  testCases?: TestCase[]
}

interface TestResult {
  testCaseId: string
  passed: boolean
  actualOutput: string
  expectedOutput: string
  executionTime: number
  error?: string
}

interface ViolationEvent {
  type: "fullscreen" | "tab_switch"
  message: string
  timestamp: Date
  severity: "low" | "medium" | "high"
}

interface MCQAnswer {
  type: "MCQ";
  value: string;
}

interface CodingAnswer {
  type: "CODING";
  code: string;
  language: string;
  results: TestResult[];
}

type Answer = MCQAnswer | CodingAnswer;

interface TestData {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
}

export default function TestInterface() {
  const params = useParams<{ testLink: string }>()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [testData, setTestData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)

  const [violations, setViolations] = useState<ViolationEvent[]>([])

  useEffect(() => {
    fetchTestData()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation("tab_switch", "Student switched tabs or minimized window", "high")
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitted) {
        addViolation("fullscreen", "Student exited fullscreen mode", "high")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [params.testLink])

  useEffect(() => {
    if (testData && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [testData, timeRemaining])

  const fetchTestData = async () => {
    try {
      const response = await fetch(`/api/tests/link/${params.testLink}`)
      const data = await response.json()
      setTestData(data.test)
      setTimeRemaining(data.test.duration * 60)
    } catch (error) {
      console.error("Error fetching test:", error)
    } finally {
      setLoading(false)
    }
  }

  const addViolation = useCallback(
    (type: ViolationEvent["type"], message: string, severity: ViolationEvent["severity"]) => {
      const violation: ViolationEvent = {
        type,
        message,
        timestamp: new Date(),
        severity,
      }

      setViolations((prev) => [...prev, violation])

      fetch("/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testLink: params.testLink,
          violation,
        }),
      }).catch(console.error)
    },
    [params.testLink],
  )

  const handleSubmit = async () => {
    if (isSubmitted) return

    setIsSubmitted(true)

    try {
      const response = await fetch(`/api/tests/${params.testLink}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testLink: params.testLink,
          answers,
          timeSpent: testData ?  testData.duration * 60 - timeRemaining : 0,
          violations,
        }),
      })

      const result = await response.json()
      console.log("Test submitted:", result)

      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    } catch (error) {
      console.error("Error submitting test:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleCodeSubmit = (questionId: string, code: string, language: string, results: TestResult[]) => {
    const codeAnswer: CodingAnswer = {
      type: "CODING",
      code,
      language,
      results,
    }
    handleAnswerChange(questionId, codeAnswer)
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((key) => answers[key] !== undefined).length
  }

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id]

    switch (question.type) {
      case "MCQ":
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer && answer.type === "MCQ" ? answer.value : ""}
              onValueChange={(value) =>
                handleAnswerChange(question.id, { type: "MCQ", value })
              }
            >
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "CODING":
        return (
          <CodeEditor
            question={question}
            onSubmit={(code, language, results) => handleCodeSubmit(question.id, code, language, results)}
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Test Not Found</CardTitle>
            <CardDescription>The requested test could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Test Submitted Successfully!</CardTitle>
            <CardDescription>Your answers have been saved and submitted for evaluation.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Questions Answered: {getAnsweredCount()}/{testData.questions.length}
              </p>
              <p className="text-sm text-gray-600">Time Used: {formatTime(testData.duration * 60 - timeRemaining)}</p>
              {violations.length > 0 && (
                <p className="text-sm text-orange-600">Violations Detected: {violations.length}</p>
              )}
            </div>
            <Button className="w-full" onClick={() => (window.location.href = "/student")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = testData.questions[currentQuestionIndex]
  const highViolations = violations.filter((v) => v.severity === "high").length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h1 className="font-semibold">{testData.title}</h1>
                  <p className="text-sm text-gray-500">{testData.subject}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-red-500" />
                <span
                  className={`font-mono text-lg ${timeRemaining < 600 ? "text-red-500 font-bold" : "text-gray-700"}`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <Badge variant="outline">
                {getAnsweredCount()}/{testData.questions.length} Answered
              </Badge>

              {violations.length > 0 && (
                <Badge variant={highViolations > 0 ? "destructive" : "secondary"}>
                  <Shield className="w-4 h-4 mr-1" />
                  {violations.length} Violations
                </Badge>
              )}

              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {timeRemaining < 600 && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">Warning: Less than 10 minutes remaining!</AlertDescription>
        </Alert>
      )}

      {highViolations > 0 && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            Warning: {highViolations} high-severity violations detected. Your test may be flagged for review.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Question Navigation</CardTitle>
                <Progress value={(getAnsweredCount() / testData.questions.length) * 100} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {testData.questions.map((question: Question, index: number) => {
                    const isAnswered = answers[question.id] !== undefined
                    const isFlagged = flaggedQuestions.has(question.id)
                    const isCurrent = index === currentQuestionIndex

                    return (
                      <Button
                        key={question.id}
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        className={`relative h-10 ${
                          isAnswered ? "bg-green-100 border-green-300 hover:bg-green-200" : ""
                        } ${isFlagged ? "ring-2 ring-orange-300" : ""}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500 fill-orange-500" />
                        )}
                      </Button>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Flagged</span>
                  </div>
                </div>

                {/* Basic Monitoring Info */}
                {violations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-red-600">Recent Activity:</h4>
                    <div className="max-h-20 overflow-y-auto space-y-1">
                      {violations.slice(-3).map((violation, index) => (
                        <Alert key={index} variant="destructive" className="py-1">
                          <AlertTriangle className="h-3 w-3" />
                          <AlertDescription className="text-xs">{violation.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1} of {testData.questions.length}
                      </Badge>
                      <Badge>
                        {currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}
                      </Badge>
                      <Badge variant="secondary">{currentQuestion.type}</Badge>
                      {answers[currentQuestion.id] &&
                        currentQuestion.type === "CODING" &&
                        answers[currentQuestion.id].type === "CODING" && (
                          <Badge variant="default">
                            Score: {
                              (answers[currentQuestion.id] as CodingAnswer).results &&
                              (answers[currentQuestion.id] as CodingAnswer).results.length > 0
                                ? Math.round(
                                    ((answers[currentQuestion.id] as CodingAnswer).results.filter((r) => r.passed).length /
                                      (answers[currentQuestion.id] as CodingAnswer).results.length) * 100
                                  )
                                : 0
                            }%
                          </Badge>
                        )}
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                      {currentQuestion.type === "MCQ" ? currentQuestion.question : "Coding Problem"}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? "text-orange-500" : "text-gray-400"}
                  >
                    <Flag className={`w-5 h-5 ${flaggedQuestions.has(currentQuestion.id) ? "fill-orange-500" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderQuestion(currentQuestion)}

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {testData.questions.length}
                  </div>

                  {currentQuestionIndex < testData.questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}