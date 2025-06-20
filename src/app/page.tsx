"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import {
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  UserCheck,
  Zap,
  User,
} from "lucide-react";
import Link from "next/link";
import type { User as UserType } from "@/types";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    setIsVisible(true);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UExam
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Features</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">About Us</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Contact Us</Button>
              </Link>
              {isLoading ? (
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded-full"></div>
              ) : user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Next-Gen Test Management
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Testing Experience
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Create, manage, and take exams with our comprehensive platform.
                Designed for educators and students to excel in the digital age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isLoading ? (
                  <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-md"></div>
                ) : user ? (
                  <>
                  <Link href={user.role === "STUDENT" ? "/student" : "/teacher"}>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Join as Teacher
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="lg" variant="outline">
                        Join as Student
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-bounce delay-1000"></div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Testing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make exam creation and management
              effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Smart Test Creation",
                description:
                  "Create diverse question types including MCQs, fill-in-the-blanks, and essay questions with our intuitive editor.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Users,
                title: "Student Management",
                description:
                  "Easily manage student enrollments, track progress, and organize classes with comprehensive dashboards.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Get detailed insights into student performance with comprehensive reports and analytics.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Shield,
                title: "Secure Testing",
                description:
                  "Ensure exam integrity with advanced security features and anti-cheating measures.",
                color: "from-red-500 to-red-600",
              },
              {
                icon: Clock,
                title: "Timed Assessments",
                description:
                  "Set custom time limits and create urgency with built-in timer functionality.",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: CheckCircle,
                title: "Auto Grading",
                description:
                  "Save time with automatic grading for objective questions and manual review for subjective ones.",
                color: "from-teal-500 to-teal-600",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10K+", label: "Active Students" },
              { number: "500+", label: "Educators" },
              { number: "50K+", label: "Tests Created" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of educators and students who trust uexam for their
            assessment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Start as Teacher
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" variant="outline">
                <GraduationCap className="w-5 h-5 mr-2" />
                Join as Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
