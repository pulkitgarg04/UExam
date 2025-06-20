"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  FileText,
  User,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  teacherProfile: {
    designation: string;
    department: string[];
    studentYears: string[];
    degreesTeaching?: string[];
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentProfile: {
    rollNumber: string;
    department: string;
    yearOfStudy: number;
    courseName: string;
  };
  createdAt: string;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  testLink: string;
  department: string;
  degree: string;
  studentYear: string;
  date: string;
  duration: number;
  totalMarks: number;
  _count: {
    testResponses: number;
  };
}

interface TestSubmission {
  id: string;
  marksObtained: number;
  totalMarks: number;
  submittedAt: string;
  user: {
    name: string;
    email: string;
    studentProfile: {
      rollNumber: string;
    };
  };
  test: {
    title: string;
    subject: string;
  };
}

export default function TeacherPortalContent() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await axios.get("/api/data/teacher", {
        withCredentials: true,
      });

      const { teacher, students, tests, submissions } = data;

      setTeacher(teacher);
      setStudents(students || []);
      setTests(tests || []);
      setSubmissions(submissions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentProfile?.rollNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getYearSuffix = (year: number) => {
    if (year === 1) return "1st Year";
    if (year === 2) return "2nd Year";
    if (year === 3) return "3rd Year";
    return `${year}th Year`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{teacher?.name}</span>
              </div>
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
              {teacher?.teacherProfile?.designation} •{" "}
              {teacher?.teacherProfile?.department?.join(", ")}
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
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {teacher?.teacherProfile?.department?.join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tests Created
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tests.length}</div>
              <p className="text-xs text-muted-foreground">Total assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">Total responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.length > 0
                  ? Math.round(
                      submissions.reduce(
                        (acc, sub) =>
                          acc + (sub.marksObtained / sub.totalMarks) * 100,
                        0
                      ) / submissions.length
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="tests">My Tests</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      My Students
                    </CardTitle>
                    <CardDescription>
                      Students from{" "}
                      {teacher?.teacherProfile?.department?.join(", ")} •{" "}
                      {teacher?.teacherProfile?.studentYears?.join(", ")}
                    </CardDescription>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
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
                              {student.studentProfile?.rollNumber}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getYearSuffix(
                                student.studentProfile?.yearOfStudy || 1
                              )}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {student.studentProfile?.courseName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No students found matching your criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Tests
                </CardTitle>
                <CardDescription>Tests you have created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {test.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {test.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {test._count?.testResponses || 0} responses
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
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Test
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(test.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.duration} mins
                        </span>
                        <span>{test.totalMarks} marks</span>
                        <Badge variant="secondary" className="text-xs">
                          {test.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {test.studentYear}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {tests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tests created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Test Submissions
                </CardTitle>
                <CardDescription>Recent student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {submission.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {submission.test.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.user.studentProfile?.rollNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                submission.marksObtained /
                                  submission.totalMarks >=
                                0.6
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {submission.marksObtained}/{submission.totalMarks}
                            </Badge>
                            {submission.marksObtained / submission.totalMarks >=
                            0.6 ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{submission.test.subject}</span>
                        <span>
                          Score:{" "}
                          {Math.round(
                            (submission.marksObtained / submission.totalMarks) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                  {submissions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No submissions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
