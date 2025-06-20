import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { JwtPayload } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "JWT_SECRET"
    ) as JwtPayload;

    const userId = decoded.userId;

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
      },
    });

    if (!teacher || teacher.role !== "TEACHER" || !teacher.teacherProfile) {
      return NextResponse.json(
        { error: "Teacher not found or invalid role" },
        { status: 404 }
      );
    }

    const teacherProfile = teacher.teacherProfile;

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentProfile: {
          department: {
            in: teacherProfile.department,
          },
          yearOfStudy: {
            in: teacherProfile.studentYears.map((year) => {
              if (year === "1st Year") return 1;
              if (year === "2nd Year") return 2;
              if (year === "3rd Year") return 3;
              if (year === "4th Year") return 4;
              if (year === "5th Year") return 5;
              return Number.parseInt(year.replace(/\D/g, ""));
            }),
          },
        },
      },
      include: {
        studentProfile: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const tests = await prisma.test.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        _count: {
          select: {
            testResponses: true,
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissions = await prisma.testResponse.findMany({
      where: {
        test: {
          creatorId: userId,
        },
      },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        test: {
          select: {
            title: true,
            subject: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        teacherProfile,
      },
      students,
      tests,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}