"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  BookOpen,
  Settings,
  CheckCircle,
  FileText,
  Edit3,
} from "lucide-react";
import { DEGREES, STUDENT_YEARS, DEPARTMENTS } from "@/constants/data";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface TestCase {
  id: string;
  input: string;
  expected: string;
  isPublic: boolean;
}

interface Question {
  id: string;
  type: "MCQ" | "CODING";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  marks: number;
  testCases?: TestCase[];
}

enum QuestionType {
  MCQ = "MCQ",
  CODING = "CODING",
}

export default function CreateTest() {
  const [testDetails, setTestDetails] = useState({
    title: "",
    subject: "",
    testLink: "",
    department: "",
    degree: "",
    studentYear: "",
    date: "",
    duration: 60,
    totalMarks: 0,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    type: "MCQ",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    testCases: [],
  });

  const [currentTestCase, setCurrentTestCase] = useState<TestCase>({
    id: "",
    input: "",
    expected: "",
    isPublic: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTestCase = () => {
    if (currentTestCase.input.trim() && currentTestCase.expected.trim()) {
      const newTestCase = {
        ...currentTestCase,
        id: Date.now().toString(),
      };
      setCurrentQuestion((prev) => ({
        ...prev,
        testCases: [...(prev.testCases || []), newTestCase],
      }));
      setCurrentTestCase({
        id: "",
        input: "",
        expected: "",
        isPublic: false,
      });
    }
  };

  const removeTestCase = (id: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      testCases: prev.testCases?.filter((tc) => tc.id !== id) || [],
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question.trim()) {
      if (
        currentQuestion.type === "CODING" &&
        (!currentQuestion.testCases || currentQuestion.testCases.length === 0)
      ) {
        alert("Coding questions must have at least one test case");
        return;
      }

      const newQuestion = {
        ...currentQuestion,
        id: Date.now().toString(),
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        id: "",
        type: "MCQ",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        testCases: [],
      });
      setTestDetails((prev) => ({
        ...prev,
        totalMarks: prev.totalMarks + newQuestion.marks,
      }));
    }
  };

  const removeQuestion = (id: string) => {
    const questionToRemove = questions.find((q) => q.id === id);
    setQuestions(questions.filter((q) => q.id !== id));
    if (questionToRemove) {
      setTestDetails((prev) => ({
        ...prev,
        totalMarks: prev.totalMarks - questionToRemove.marks,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {

      const creatorId = localStorage.getItem("userId");

      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...testDetails,
          questions,
          creatorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create test");
      }

      window.location.href = "/teacher";
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.error("Error creating test:", error.message);
      } else {
        toast.error("An unknown error occurred.");
        console.error("Unknown error creating test:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionForm = () => {
    switch (currentQuestion.type) {
      case "MCQ":
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="question">
                Question
              </Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(currentQuestion.options || [])];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        options: newOptions,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant={
                      currentQuestion.correctAnswer === index
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        correctAnswer: index,
                      })
                    }
                  >
                    {currentQuestion.correctAnswer === index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      "Correct"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case "CODING":
        return (
          <div className="space-y-6">
            <div>
              <Label className="mb-2" htmlFor="question">
                Problem Statement
              </Label>
              <Textarea
                id="question"
                placeholder="Describe the coding problem with detailed requirements, constraints, and examples..."
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
                rows={8}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Test Cases</Label>
                <Badge variant="outline">
                  {currentQuestion.testCases?.length || 0} test cases
                </Badge>
              </div>

              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm">Add Test Case</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="input">
                        Input
                      </Label>
                      <Textarea
                        id="input"
                        placeholder="Enter test input..."
                        value={currentTestCase.input}
                        onChange={(e) =>
                          setCurrentTestCase({
                            ...currentTestCase,
                            input: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="expected">
                        Expected Output
                      </Label>
                      <Textarea
                        id="expected"
                        placeholder="Enter expected output..."
                        value={currentTestCase.expected}
                        onChange={(e) =>
                          setCurrentTestCase({
                            ...currentTestCase,
                            expected: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={currentTestCase.isPublic}
                        onCheckedChange={(checked) =>
                          setCurrentTestCase({
                            ...currentTestCase,
                            isPublic: checked,
                          })
                        }
                      />
                      <Label htmlFor="isPublic">
                        Public Test Case (visible to students)
                      </Label>
                    </div>
                    <Button onClick={addTestCase} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Test Case
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {currentQuestion.testCases &&
                currentQuestion.testCases.length > 0 && (
                  <div className="space-y-2">
                    {currentQuestion.testCases.map((testCase, index) => (
                      <Card key={testCase.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Test Case {index + 1}
                              </Badge>
                              <Badge
                                variant={
                                  testCase.isPublic ? "default" : "secondary"
                                }
                              >
                                {testCase.isPublic ? "Public" : "Hidden"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Input:
                                </Label>
                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Expected:
                                </Label>
                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                  {testCase.expected}
                                </pre>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTestCase(testCase.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/teacher" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold">Create Test</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || questions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2" htmlFor="title">
                    Test Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter test title"
                    value={testDetails.title}
                    onChange={(e) =>
                      setTestDetails({ ...testDetails, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="subject">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Data Structures, Machine Learning"
                    value={testDetails.subject}
                    onChange={(e) =>
                      setTestDetails({
                        ...testDetails,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="testLink">
                    Test Link *
                  </Label>
                  <Input
                    id="testLink"
                    placeholder="e.g., ds-midterm-2025"
                    value={testDetails.testLink}
                    onChange={(e) =>
                      setTestDetails({
                        ...testDetails,
                        testLink: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="department">
                    Department *
                  </Label>
                  <Select
                    value={testDetails.department}
                    onValueChange={(value) =>
                      setTestDetails({ ...testDetails, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="degree">
                    Degree *
                  </Label>
                  <Select
                    value={testDetails.degree}
                    onValueChange={(value) =>
                      setTestDetails({ ...testDetails, degree: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="studentYear">
                    Student Year *
                  </Label>
                  <Select
                    value={testDetails.studentYear}
                    onValueChange={(value) =>
                      setTestDetails({ ...testDetails, studentYear: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="date">
                    Test Date *
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={testDetails.date}
                    onChange={(e) =>
                      setTestDetails({ ...testDetails, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="duration">
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={testDetails.duration}
                    onChange={(e) =>
                      setTestDetails({
                        ...testDetails,
                        duration: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Questions:</span>
                  <Badge variant="outline">{questions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Marks:</span>
                  <Badge variant="outline">{testDetails.totalMarks}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <Badge variant="outline">{testDetails.duration} min</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Add Question
                </CardTitle>
                <CardDescription>
                  Create MCQ or coding questions for your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="mb-2" htmlFor="questionType">
                      Question Type
                    </Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={(value: QuestionType) => {
                        setCurrentQuestion({
                          ...currentQuestion,
                          type: value,
                          testCases: value === "CODING" ? [] : undefined,
                          options:
                            value === "MCQ" ? ["", "", "", ""] : undefined,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">
                          Multiple Choice Question
                        </SelectItem>
                        <SelectItem value="CODING">Coding Problem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="mb-2" htmlFor="marks">
                      Marks
                    </Label>
                    <Input
                      id="marks"
                      type="number"
                      min="1"
                      value={currentQuestion.marks}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          marks: Number.parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                {renderQuestionForm()}

                <Button onClick={addQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{question.type}</Badge>
                            <Badge>{question.marks} marks</Badge>
                            {question.type === "CODING" && (
                              <Badge variant="secondary">
                                {question.testCases?.length || 0} test cases
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">
                            {index + 1}. {question.question.substring(0, 100)}
                            {question.question.length > 100 && "..."}
                          </p>
                          {question.type === "MCQ" && question.options && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`text-sm pl-4 ${
                                    optIndex === question.correctAnswer
                                      ? "text-green-600 font-medium"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {optIndex === question.correctAnswer && " ✓"}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
