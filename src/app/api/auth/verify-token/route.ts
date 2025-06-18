import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json({ error: "Token and email are required" }, { status: 400 });
    }

    const tokenData = await prisma.verificationToken.findFirst({
      where: {
        token,
        email,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!tokenData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { email },
    });

    return NextResponse.json({
      message: "Email verified successfully",
      email,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 });
  }
}