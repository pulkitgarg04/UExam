import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        isVerified: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "JWT_SECRET",
      { expiresIn: "7d" }
    );

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Email not verified", redirectTo: `/auth/verify-email?email=${email}` },
        { status: 403 }
      );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Login successful", user: userWithoutPassword },
      {
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
