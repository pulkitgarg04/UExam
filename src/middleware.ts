import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types";

export function middleware(request: NextRequest) {
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

  if (!isPrivateRoute) {
    return NextResponse.next();
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
    console.log(decoded);

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
