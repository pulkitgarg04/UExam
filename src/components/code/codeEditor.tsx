"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Code,
  Play,
  Send,
  TestTube,
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStickIcon as Memory,
  Loader2,
  Trophy,
} from "lucide-react"
import { JUDGE0_LANGUAGES, getDefaultTemplate } from "@/lib/judge0-config"

interface TestCase {
  id: string
  input: string
  expected: string
  isPublic: boolean
}

interface TestResult {
  testCaseId: string
  passed: boolean
  actualOutput: string
  expectedOutput: string
  executionTime: number
  error?: string
}

interface CodeEditorProps {
  question: {
    id: string
    question: string
    testCases?: TestCase[]
  }
  onSubmit: (code: string, language: string, results: TestResult[]) => void
}

export function CodeEditor({ question, onSubmit }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [code, setCode] = useState(getDefaultTemplate("javascript"))
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [executionStats, setExecutionStats] = useState<{
    totalTime: number
    avgTime: number
    score?: number
    passedCount?: number
    totalCount?: number
  } | null>(null)

  useEffect(() => {
    setCode(getDefaultTemplate(selectedLanguage))
    setTestResults([])
    setExecutionStats(null)
  }, [selectedLanguage])

  const runCode = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language: selectedLanguage,
          testCases: question.testCases?.filter((tc) => tc.isPublic) || [],
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResults(result.results)
        setExecutionStats({
          totalTime: result.executionTime,
          avgTime: result.results.length > 0 ? result.executionTime / result.results.length : 0,
        })
      } else {
        throw new Error(result.error || "Code execution failed")
      }
    } catch (error) {
      console.error("Error running code:", error)
      setTestResults([
        {
          testCaseId: "error",
          passed: false,
          actualOutput: "",
          expectedOutput: "",
          executionTime: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ])
    } finally {
      setIsRunning(false)
    }
  }

  const submitCode = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/code/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language: selectedLanguage,
          testCases: question.testCases || [],
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResults(result.results)
        setExecutionStats({
          totalTime: result.executionTime,
          avgTime: result.results.length > 0 ? result.executionTime / result.results.length : 0,
          score: result.score,
          passedCount: result.passedCount,
          totalCount: result.totalCount,
        })
        onSubmit(code, selectedLanguage, result.results)
      } else {
        throw new Error(result.error || "Code submission failed")
      }
    } catch (error) {
      console.error("Error submitting code:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const passedTests = testResults.filter((r) => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      <Tabs defaultValue="problem" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="problem">Problem</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="problem" className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{question.question}</pre>
          </div>

          {question.testCases && question.testCases.filter((tc) => tc.isPublic).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Sample Test Cases
              </h4>
              {question.testCases
                .filter((tc) => tc.isPublic)
                .map((testCase) => (
                  <Card key={testCase.id} className="p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-500">Input:</Label>
                        <pre className="bg-white p-2 rounded border text-xs mt-1">{testCase.input}</pre>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Expected Output:</Label>
                        <pre className="bg-white p-2 rounded border text-xs mt-1">{testCase.expected}</pre>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Language:</span>
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JUDGE0_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runCode} disabled={isRunning}>
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Running..." : "Run"}
              </Button>
              <Button
                size="sm"
                onClick={submitCode}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[400px] font-mono text-sm border-0 resize-none"
              placeholder="Write your code here..."
            />
          </div>

          {executionStats && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Time</p>
                    <p className="font-medium">{Math.round(executionStats.totalTime)}ms</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Test Cases</p>
                    <p className="font-medium">
                      {executionStats.passedCount || passedTests}/{executionStats.totalCount || totalTests}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Memory className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Time</p>
                    <p className="font-medium">{Math.round(executionStats.avgTime)}ms</p>
                  </div>
                </div>
              </Card>
              {executionStats.score !== undefined && (
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="font-medium">{executionStats.score}%</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Test Results</h4>
                <div className="flex gap-2">
                  <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                    {passedTests}/{totalTests} Passed
                  </Badge>
                  {executionStats?.score !== undefined && (
                    <Badge variant={executionStats.score >= 70 ? "default" : "secondary"}>
                      Score: {executionStats.score}%
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <Card key={result.testCaseId} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Test Case {index + 1}</span>
                        <Badge variant={result.passed ? "default" : "destructive"} className="ml-2">
                          {result.passed ? "PASSED" : "FAILED"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {Math.round(result.executionTime)}ms
                      </div>
                    </div>

                    {!result.passed && (
                      <div className="mt-2 space-y-2 text-xs">
                        <div>
                          <Label className="text-gray-500">Expected:</Label>
                          <pre className="bg-gray-50 p-2 rounded mt-1">{result.expectedOutput}</pre>
                        </div>
                        <div>
                          <Label className="text-gray-500">Actual:</Label>
                          <pre className="bg-gray-50 p-2 rounded mt-1">{result.actualOutput}</pre>
                        </div>
                        {result.error && (
                          <div>
                            <Label className="text-red-500">Error:</Label>
                            <pre className="bg-red-50 p-2 rounded mt-1 text-red-600">{result.error}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Run your code to see test results</p>
              <p className="text-sm mt-2">Click &quote;Run&quote; to test with sample cases or &quote;Submit&quote; for full evaluation</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}