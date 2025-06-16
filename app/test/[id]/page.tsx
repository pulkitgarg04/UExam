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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  Timer,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id: string;
  type: "mcq" | "fill-blank" | "essay" | "true-false";
  question: string;
  options?: string[];
  points: number;
}

export default function TestInterface({}: { params: { id: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(7200); // in secs
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );

  const testData = {
    title: "Mathematics Final Exam",
    subject: "Mathematics",
    duration: 120,
    totalQuestions: 25,
    totalPoints: 100,
    instructions:
      "Read each question carefully. You can navigate between questions and flag questions for review. Make sure to submit your test before time runs out.",
    questions: [
      {
        id: "1",
        type: "mcq" as const,
        question: "What is the derivative of x² + 3x + 2?",
        options: ["2x + 3", "x² + 3", "2x + 2", "x + 3"],
        points: 4,
      },
      {
        id: "2",
        type: "fill-blank" as const,
        question: "The integral of 2x dx is _____.",
        points: 3,
      },
      {
        id: "3",
        type: "essay" as const,
        question:
          "Explain the fundamental theorem of calculus and provide an example of its application.",
        points: 10,
      },
      {
        id: "4",
        type: "true-false" as const,
        question: "The limit of sin(x)/x as x approaches 0 is equal to 1.",
        points: 2,
      },
      {
        id: "5",
        type: "mcq" as const,
        question:
          "Which of the following is the correct formula for the area of a circle?",
        options: ["πr²", "2πr", "πd", "r²"],
        points: 3,
      },
    ],
  };

  const currentQuestion = testData.questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(
      (key) => answers[key] !== undefined && answers[key] !== ""
    ).length;
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case "mcq":
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "fill-blank":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Enter your answer"
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="text-lg p-4"
            />
          </div>
        );

      case "essay":
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Write your answer here..."
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[200px] text-base"
              rows={8}
            />
            <div className="text-sm text-gray-500">
              Word count:{" "}
              {answer
                ? answer.split(" ").filter((word: string) => word.length > 0)
                    .length
                : 0}
            </div>
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="true" id={`${question.id}-true`} />
                <Label
                  htmlFor={`${question.id}-true`}
                  className="flex-1 cursor-pointer font-medium"
                >
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="false" id={`${question.id}-false`} />
                <Label
                  htmlFor={`${question.id}-false`}
                  className="flex-1 cursor-pointer font-medium"
                >
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Test Submitted Successfully!</CardTitle>
            <CardDescription>
              Your answers have been saved and submitted for grading.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Questions Answered: {getAnsweredCount()}/
                {testData.totalQuestions}
              </p>
              <p className="text-sm text-gray-600">
                Time Used: {formatTime(7200 - timeRemaining)}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/student")}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h1 className="font-semibold">{testData.title}</h1>
                  <p className="text-sm text-gray-500">{testData.subject}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-red-500" />
                <span
                  className={`font-mono text-lg ${
                    timeRemaining < 600
                      ? "text-red-500 font-bold"
                      : "text-gray-700"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <Badge variant="outline">
                {getAnsweredCount()}/{testData.totalQuestions} Answered
              </Badge>

              <Button
                onClick={() => setIsSubmitted(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {timeRemaining < 600 && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            Warning: Less than 10 minutes remaining!
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Question Navigation</CardTitle>
                <Progress
                  value={(getAnsweredCount() / testData.totalQuestions) * 100}
                  className="h-2"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {testData.questions.map((question, index) => {
                    const isAnswered =
                      answers[question.id] !== undefined &&
                      answers[question.id] !== "";
                    const isFlagged = flaggedQuestions.has(question.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <Button
                        key={question.id}
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        className={`relative h-10 ${
                          isAnswered
                            ? "bg-green-100 border-green-300 hover:bg-green-200"
                            : ""
                        } ${isFlagged ? "ring-2 ring-orange-300" : ""}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500 fill-orange-500" />
                        )}
                      </Button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1} of{" "}
                        {testData.totalQuestions}
                      </Badge>
                      <Badge>
                        {currentQuestion.points}{" "}
                        {currentQuestion.points === 1 ? "point" : "points"}
                      </Badge>
                      <Badge variant="secondary">
                        {currentQuestion.type.toUpperCase().replace("-", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={
                      flaggedQuestions.has(currentQuestion.id)
                        ? "text-orange-500"
                        : "text-gray-400"
                    }
                  >
                    <Flag
                      className={`w-5 h-5 ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? "fill-orange-500"
                          : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderQuestion(currentQuestion)}

                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.max(0, currentQuestionIndex - 1)
                      )
                    }
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of{" "}
                    {testData.totalQuestions}
                  </div>

                  {currentQuestionIndex < testData.totalQuestions - 1 ? (
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(currentQuestionIndex + 1)
                      }
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsSubmitted(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
