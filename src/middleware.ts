import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types";
import { prisma } from "./lib/prisma";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const privateRoutes = [
    "/teacher",
    "/student",
    "/admin",
    "/profile",
    "/dashboard",
  ];

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isPrivateRoute || pathname === '/profile/complete') {
    return NextResponse.next();
  }

  if (!isPrivateRoute) {
    return NextResponse.next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "JWT_SECRET"
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, profileCompleted: true, role: true },
    });

    if (!user) {
      console.error(`User not found for email: ${decoded.email}`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if(!user.profileCompleted) {
      return NextResponse.redirect(new URL("/profile/complete", request.url));
    }

    if (pathname.startsWith("/teacher") && decoded.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/student") && decoded.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log("error: ", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
