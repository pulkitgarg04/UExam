import { type NextRequest, NextResponse } from "next/server"
import { getLanguageByValue } from "@/lib/judge0-config"

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"

// interface TestCase {
//   id: string
//   input: string
//   expected: string
//   isPublic: boolean
// }

interface TestResult {
  testCaseId: string
  passed: boolean
  actualOutput: string
  expectedOutput: string
  executionTime: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: "Judge0 API key not configured" }, { status: 500 })
    }

    const { code, language, testCases } = await request.json()

    if (!code || !language || !testCases) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const languageConfig = getLanguageByValue(language)
    if (!languageConfig) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 })
    }

    const results: TestResult[] = []
    let totalExecutionTime = 0
    let passedCount = 0

    for (const testCase of testCases) {
      try {
        const result = await executeCode(code, languageConfig.id, testCase.input)

        const passed = result.stdout?.trim() === testCase.expected.trim()
        const testResult: TestResult = {
          testCaseId: testCase.id,
          passed,
          actualOutput: result.stdout || "",
          expectedOutput: testCase.expected,
          executionTime: Number.parseFloat(result.time || "0") * 1000,
          error: result.stderr || result.compile_output || undefined,
        }

        results.push(testResult)
        totalExecutionTime += testResult.executionTime
        if (passed) passedCount++
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: "",
          expectedOutput: testCase.expected,
          executionTime: 0,
          error: error instanceof Error ? error.message : "Execution failed",
        })
      }
    }

    const score = testCases.length > 0 ? (passedCount / testCases.length) * 100 : 0

    return NextResponse.json({
      success: true,
      results,
      executionTime: totalExecutionTime,
      language: languageConfig.name,
      score: Math.round(score),
      passedCount,
      totalCount: testCases.length,
    })
  } catch (error) {
    console.error("Error in code submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function executeCode(code: string, languageId: number, input: string) {
  const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": RAPIDAPI_KEY!,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: code,
      stdin: input,
      expected_output: null,
      cpu_time_limit: 3,
      memory_limit: 256000,
    }),
  })

  if (!submissionResponse.ok) {
    const errorText = await submissionResponse.text()
    throw new Error(`Judge0 submission failed: ${submissionResponse.status} - ${errorText}`)
  }

  const result = await submissionResponse.json()

  if (result.status?.id === 6) {
    throw new Error(result.compile_output || "Compilation failed")
  }

  if (result.status?.id === 5) {
    throw new Error("Time limit exceeded")
  }

  if (result.status?.id === 11 || result.status?.id === 12) {
    throw new Error(result.stderr || "Runtime error occurred")
  }

  return result
}