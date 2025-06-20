import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";

interface TestCase {
  input: string;
  expected: string;
  isPublic: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, subject, testLink, department, degree, studentYear, date, duration, totalMarks, questions, creatorId } = body;

    if (
      !title ||
      !subject ||
      !testLink ||
      !department ||
      !degree ||
      !studentYear ||
      !date ||
      !duration ||
      !totalMarks ||
      !questions ||
      !creatorId
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required" }, { status: 400 })
    }

    const newTest = await prisma.test.create({
      data: {
        title,
        subject,
        testLink,
        department,
        degree,
        studentYear,
        date,
        duration,
        totalMarks,
        creatorId,
        questions: {
          create: questions.map((q) => ({
            type: q.type,
            question: q.question,
            options: q.type === "MCQ" ? q.options || [] : [],
            marks: q.marks || 1,
            testCases: {
              create: q.testCases?.map((tc: TestCase) => ({
                input: tc.input,
                expected: tc.expected,
                isPublic: tc.isPublic,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(
      {
        message: "Test created successfully",
        test: newTest,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}