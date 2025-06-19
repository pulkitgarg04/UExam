import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, role, profileData } = await request.json();

    if (!userId || !role || !profileData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role === "TEACHER") {
      const requiredFields = [
        "designation",
        "department",
        "employeeId",
        "gender",
        "dateOfBirth",
        "phoneNumber",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field]
      );

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(", ")}` },
          { status: 400 }
        );
      }

      await prisma.teacherProfile.create({
        data: {
          userId,
          designation: profileData.designation,
          department: profileData.department || [],
          degreesTeaching: profileData.degreesTeaching || [],
          studentYears: profileData.studentYears || [],
          employeeId: profileData.employeeId,
          gender: profileData.gender,
          dateOfBirth: new Date(profileData.dateOfBirth),
          phoneNumber: profileData.phoneNumber,
        },
      });
    } else if (role === "STUDENT") {
      const requiredFields = [
        "rollNumber",
        "department",
        "yearOfStudy",
        "courseName",
        "dateOfBirth",
        "gender",
        "phoneNumber",
        "permanentAddress",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field]
      );

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(", ")}` },
          { status: 400 }
        );
      }

      await prisma.studentProfile.create({
        data: {
          userId,
          rollNumber: profileData.rollNumber,
          department: profileData.department,
          yearOfStudy: Number(profileData.yearOfStudy),
          courseName: profileData.courseName,
          dateOfBirth: new Date(profileData.dateOfBirth),
          gender: profileData.gender,
          bloodGroup: profileData.bloodGroup || null,
          phoneNumber: profileData.phoneNumber,
          permanentAddress: profileData.permanentAddress,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { profileCompleted: true },
    });

    return NextResponse.json({
      message: "Profile completed successfully",
      profileCompleted: true,
    });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing userId or role" },
        { status: 400 }
      );
    }

    let profile = null;

    if (role === "TEACHER") {
      profile = await prisma.teacherProfile.findUnique({
        where: { userId },
      });
    } else if (role === "STUDENT") {
      profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
