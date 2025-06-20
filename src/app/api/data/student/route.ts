import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const student = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yearSuffix =
      student.studentProfile?.yearOfStudy === 1
        ? "1st Year"
        : student.studentProfile?.yearOfStudy === 2
        ? "2nd Year"
        : student.studentProfile?.yearOfStudy === 3
        ? "3rd Year"
        : student.studentProfile?.yearOfStudy === 4
        ? "4th Year"
        : `${student.studentProfile?.yearOfStudy}th Year`;

    const availableTests = await prisma.test.findMany({
      where: {
        department: student.studentProfile?.department || undefined,
        studentYear: yearSuffix,
        NOT: {
          testResponses: {
            some: {
              userId: student.id,
            },
          },
        },
        date: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        creator: {
          include: {
            teacherProfile: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const completedTests = await prisma.testResponse.findMany({
      where: {
        userId: student.id,
      },
      include: {
        test: {
          select: {
            title: true,
            subject: true,
            duration: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      student,
      availableTests,
      completedTests,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
