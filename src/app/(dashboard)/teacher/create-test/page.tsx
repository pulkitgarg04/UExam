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
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface Question {
  id: string;
  type: "mcq" | "fill-blank" | "essay" | "true-false";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

export default function CreateTest() {
  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    subject: "",
    duration: 60,
    totalPoints: 0,
    instructions: "",
    randomizeQuestions: false,
    showResults: true,
    allowRetake: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
  });

  const addQuestion = () => {
    if (currentQuestion.question.trim()) {
      const newQuestion = {
        ...currentQuestion,
        id: Date.now().toString(),
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        id: "",
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
      });
      setTestDetails((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints + newQuestion.points,
      }));
    }
  };

  const removeQuestion = (id: string) => {
    const questionToRemove = questions.find((q) => q.id === id);
    setQuestions(questions.filter((q) => q.id !== id));
    if (questionToRemove) {
      setTestDetails((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints - questionToRemove.points,
      }));
    }
  };

  const renderQuestionForm = () => {
    switch (currentQuestion.type) {
      case "mcq":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
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

      case "fill-blank":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question with _____ for blanks..."
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="answer">Correct Answer</Label>
              <Input
                id="answer"
                placeholder="Enter the correct answer"
                value={(currentQuestion.correctAnswer as string) || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );

      case "essay":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your essay question..."
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="guidelines">Grading Guidelines (Optional)</Label>
              <Textarea
                id="guidelines"
                placeholder="Enter grading criteria or sample answer..."
                rows={3}
              />
            </div>
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your true/false question..."
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-4">
              <Label>Correct Answer:</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={
                    currentQuestion.correctAnswer === "true"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswer: "true",
                    })
                  }
                >
                  True
                </Button>
                <Button
                  type="button"
                  variant={
                    currentQuestion.correctAnswer === "false"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswer: "false",
                    })
                  }
                >
                  False
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Save Test
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Test Configuration */}
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
                  <Label htmlFor="title">Test Title</Label>
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
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={testDetails.subject}
                    onValueChange={(value) =>
                      setTestDetails({ ...testDetails, subject: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the test"
                    value={testDetails.description}
                    onChange={(e) =>
                      setTestDetails({
                        ...testDetails,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Test instructions for students"
                    value={testDetails.instructions}
                    onChange={(e) =>
                      setTestDetails({
                        ...testDetails,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomize">Randomize Questions</Label>
                    <Switch
                      id="randomize"
                      checked={testDetails.randomizeQuestions}
                      onCheckedChange={(checked) =>
                        setTestDetails({
                          ...testDetails,
                          randomizeQuestions: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="results">Show Results</Label>
                    <Switch
                      id="results"
                      checked={testDetails.showResults}
                      onCheckedChange={(checked) =>
                        setTestDetails({ ...testDetails, showResults: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="retake">Allow Retake</Label>
                    <Switch
                      id="retake"
                      checked={testDetails.allowRetake}
                      onCheckedChange={(checked) =>
                        setTestDetails({ ...testDetails, allowRetake: checked })
                      }
                    />
                  </div>
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
                  <span className="text-sm text-gray-600">Total Points:</span>
                  <Badge variant="outline">{testDetails.totalPoints}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <Badge variant="outline">{testDetails.duration} min</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Add Question
                </CardTitle>
                <CardDescription>
                  Create different types of questions for your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={(value) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          type: value as Question["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="fill-blank">
                          Fill in the Blank
                        </SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          points: Number.parseInt(e.target.value) || 1,
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

            {/* Questions List */}
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
                            <Badge variant="outline">
                              {question.type.toUpperCase()}
                            </Badge>
                            <Badge>{question.points} pts</Badge>
                          </div>
                          <p className="font-medium">
                            {index + 1}. {question.question}
                          </p>
                          {question.type === "mcq" && question.options && (
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
                          {(question.type === "fill-blank" ||
                            question.type === "true-false") && (
                            <p className="text-sm text-green-600 mt-1">
                              Answer: {question.correctAnswer}
                            </p>
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
    </div>
  );
}
