import { type NextRequest, NextResponse } from "next/server"

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"

export async function GET(request: NextRequest, { params }: { params: Promise<{ testLink: string }> }) {
  try {
    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: "Judge0 API key not configured" }, { status: 500 })
    }

    const token = (await params).testLink
    if (!token) {
      return NextResponse.json({ error: "Missing submission token" }, { status: 400 })
    }
    
    const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    })

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
    })
  } catch (error) {
    console.error("Error fetching submission status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}