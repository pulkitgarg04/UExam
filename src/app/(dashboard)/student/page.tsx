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
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  User,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface UpcomingExam {
  id: number;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  questions: number;
}

interface CompletedExam {
  id: number;
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  status: string;
}

interface ExamData {
  upcomingExams: UpcomingExam[];
  completedExams: CompletedExam[];
}

export default function StudentPortal() {
  const [data, setData] = useState<ExamData>({
    upcomingExams: [],
    completedExams: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data.json");
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  const { upcomingExams, completedExams } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UExam
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Student Portal</Badge>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Pulkit Garg!
          </h1>
          <p className="text-gray-600">
            Track your progress and manage your upcoming coding challenges.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Challenges
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground">
                Next challenge in 3 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Challenges
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExams.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90%</div>
              <p className="text-xs text-muted-foreground">
                +1.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Achievements
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Certificates earned
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Challenges
                </CardTitle>
                <CardDescription>Your scheduled coding tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-gray-600">{exam.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exam.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.time}
                        </span>
                        <span>{exam.questions} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exam.duration}</Badge>
                      <Link href={`/challenge/${exam.id}`}>
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedExams.map((exam) => (
                  <div key={exam.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{exam.title}</p>
                        <p className="text-xs text-gray-500">{exam.date}</p>
                      </div>
                      <Badge
                        variant={exam.score >= 80 ? "default" : "secondary"}
                      >
                        {exam.score}%
                      </Badge>
                    </div>
                    <Progress value={exam.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
