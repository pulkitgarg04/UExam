"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  FileText,
  Settings,
  User,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeacherPortal() {
  const students = [
    {
      id: 1,
      name: "Aarav Patel",
      email: "aarav.be23@chitkara.edu.in",
      class: "B.E. 1st Year",
      lastActive: "2 hours ago",
      score: 92,
    },
    {
      id: 2,
      name: "Ishita Sharma",
      email: "ishita.be23@chitkara.edu.in",
      class: "B.E. 2nd Year",
      lastActive: "1 day ago",
      score: 85,
    },
    {
      id: 3,
      name: "Vihaan Raj",
      email: "vihaan.be23@chitkara.edu.in",
      class: "B.E. 3rd Year",
      lastActive: "3 hours ago",
      score: 88,
    },
    {
      id: 4,
      name: "Ananya Mehta",
      email: "ananya.be23@chitkara.edu.in",
      class: "B.E. Final Year",
      lastActive: "5 hours ago",
      score: 91,
    },
    {
      id: 5,
      name: "Aditya Singh",
      email: "aditya.be23@chitkara.edu.in",
      class: "B.E. 1st Year",
      lastActive: "1 hour ago",
      score: 94,
    },
    {
      id: 6,
      name: "Pulkit Garg",
      email: "pulkit0940.be23@chitkara.edu.in",
      class: "B.E. 3rd Year",
      lastActive: "1 min ago",
      score: 100,
    },
  ];

  const recentTests = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      students: 25,
      completed: 18,
      avgScore: 87,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Python Programming Midterm",
      students: 30,
      completed: 30,
      avgScore: 82,
      date: "2024-01-12",
    },
    {
      id: 3,
      title: "Data Structures and Algorithms Test",
      students: 22,
      completed: 15,
      avgScore: 89,
      date: "2024-01-10",
    },
  ];

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
              <Badge variant="secondary">Teacher Portal</Badge>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your students and create assessments
            </p>
          </div>
          <Link href="/teacher/create-test">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tests
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 ending this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">86.2%</div>
              <p className="text-xs text-muted-foreground">
                +3.2% from last test
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tests Created
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Students
                    </CardTitle>
                    <CardDescription>
                      Manage your student roster
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search students..." className="pl-10" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.email}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {student.class}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Last active: {student.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            student.score >= 90 ? "default" : "secondary"
                          }
                        >
                          {student.score}%
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="space-y-2 p-3 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{test.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {test.completed}/{test.students}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg: {test.avgScore}%</span>
                      <span>{test.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/teacher/create-test">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Test
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Classes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
