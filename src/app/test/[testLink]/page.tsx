"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  Timer,
  Shield,
  Code,
  Play,
  Send,
  TestTube,
  CheckCircle2,
  XCircle,
  Camera,
  Mic,
  Eye,
  AlertTriangle,
  Volume2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useParams } from "next/navigation";

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
  marks: number;
  testCases?: TestCase[];
}

interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  error?: string;
}

interface ViolationEvent {
  type:
    | "camera"
    | "audio"
    | "fullscreen"
    | "tab_switch"
    | "multiple_faces"
    | "no_face";
  message: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

interface MCQAnswer {
  type: "MCQ";
  value: string;
}

interface CodingAnswer {
  type: "CODING";
  code: string;
  language: string;
  results: TestResult[];
}

type Answer = MCQAnswer | CodingAnswer;

interface TestData {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
}

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "c", label: "C", extension: "c" },
];

const DEFAULT_CODE_TEMPLATES = {
  javascript: `function solution() {
    // Write your code here
    
}

// Do not modify below this line
console.log(solution());`,
  python: `def solution():
    # Write your code here
    pass

# Do not modify below this line
print(solution())`,
  java: `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
    
    public Object solution() {
        // Write your code here
        return null;
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
};

export default function TestInterface() {
  const params = useParams<{ testLink: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [proctoringStatus, setProctoringStatus] = useState({
    camera: false,
    audio: false,
    faceDetected: false,
    multipleFaces: false,
    audioLevel: 0,
  });

  const [selectedLanguage, setSelectedLanguage] = useState<
    Record<string, string>
  >({});
  const [code, setCode] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>(
    {}
  );
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});
  const [isSubmittingCode, setIsSubmittingCode] = useState<
    Record<string, boolean>
  >({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    fetchTestData();
    startProctoring();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation(
          "tab_switch",
          "Student switched tabs or minimized window",
          "high"
        );
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitted) {
        addViolation("fullscreen", "Student exited fullscreen mode", "high");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      stopProctoring();
    };
  }, [params.testLink]);

  useEffect(() => {
    if (testData && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testData, timeRemaining]);

  const fetchTestData = async () => {
    try {
      const response = await fetch(`/api/tests/link/${params.testLink}`);
      const data = await response.json();
      setTestData(data.test);
      setTimeRemaining(data.test.duration * 60);

      const initialLanguages: Record<string, string> = {};
      const initialCode: Record<string, string> = {};

      data.test.questions.forEach((question: Question) => {
        if (question.type === "CODING") {
          initialLanguages[question.id] = "javascript";
          initialCode[question.id] = DEFAULT_CODE_TEMPLATES.javascript;
        }
      });

      setSelectedLanguage(initialLanguages);
      setCode(initialCode);
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setLoading(false);
    }
  };

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setupAudioMonitoring(stream);

      startFaceDetection();

      setProctoringStatus((prev) => ({
        ...prev,
        camera: true,
        audio: true,
      }));
    } catch (error) {
      console.error("Error starting proctoring:", error);
      addViolation("camera", "Failed to access camera/microphone", "high");
    }
  };

  const stopProctoring = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setProctoringStatus((prev) => ({
      ...prev,
      camera: false,
      audio: false,
    }));
  };

  const setupAudioMonitoring = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    monitorAudioLevel();
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkAudio = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      setProctoringStatus((prev) => ({ ...prev, audioLevel: average }));

      if (average > 50) {
        addViolation("audio", "Suspicious audio activity detected", "medium");
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  const startFaceDetection = () => {
    const detectFaces = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const mockFaceDetected = Math.random() > 0.2;
      const mockMultipleFaces = Math.random() > 0.95;

      setProctoringStatus((prev) => ({
        ...prev,
        faceDetected: mockFaceDetected,
        multipleFaces: mockMultipleFaces,
      }));

      if (!mockFaceDetected) {
        addViolation(
          "no_face",
          "No face detected - student may have left the frame",
          "medium"
        );
      }

      if (mockMultipleFaces) {
        addViolation(
          "multiple_faces",
          "Multiple persons detected in frame",
          "high"
        );
      }

      setTimeout(detectFaces, 5000);
    };

    setTimeout(detectFaces, 5000);
  };

  const addViolation = useCallback(
    (
      type: ViolationEvent["type"],
      message: string,
      severity: ViolationEvent["severity"]
    ) => {
      const violation: ViolationEvent = {
        type,
        message,
        timestamp: new Date(),
        severity,
      };

      setViolations((prev) => [...prev, violation]);

      fetch("/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testLink: params.testLink,
          violation,
        }),
      }).catch(console.error);
    },
    [params.testLink]
  );

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);

    try {
      const response = await fetch(`/api/tests/${params.testLink}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testLink: params.testLink,
          answers,
          code,
          selectedLanguage,
          timeSpent: testData ? testData.duration * 60 - timeRemaining : 0,
          violations,
        }),
      });

      const result = await response.json();
      console.log("Test submitted:", result);

      stopProctoring();

      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleLanguageChange = (questionId: string, language: string) => {
    setSelectedLanguage((prev) => ({ ...prev, [questionId]: language }));
    setCode((prev) => ({
      ...prev,
      [questionId]:
        DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES],
    }));
  };

  const handleCodeChange = (questionId: string, newCode: string) => {
    setCode((prev) => ({ ...prev, [questionId]: newCode }));
  };

  const runCode = async (questionId: string) => {
    setIsRunning((prev) => ({ ...prev, [questionId]: true }));

    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          code: code[questionId],
          language: selectedLanguage[questionId],
          testCases:
            currentQuestion.testCases?.filter((tc) => tc.isPublic) || [],
        }),
      });

      const result = await response.json();
      setTestResults((prev) => ({ ...prev, [questionId]: result.results }));
    } catch (error) {
      console.error("Error running code:", error);
    } finally {
      setIsRunning((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const submitCode = async (questionId: string) => {
    setIsSubmittingCode((prev) => ({ ...prev, [questionId]: true }));

    try {
      const response = await fetch("/api/code/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          code: code[questionId],
          language: selectedLanguage[questionId],
          testCases: currentQuestion.testCases || [],
        }),
      });

      const result = await response.json();
      setTestResults((prev) => ({ ...prev, [questionId]: result.results }));
      handleAnswerChange(questionId, {
        type: "CODING",
        code: code[questionId],
        language: selectedLanguage[questionId],
        results: result.results,
      });
    } catch (error) {
      console.error("Error submitting code:", error);
    } finally {
      setIsSubmittingCode((prev) => ({ ...prev, [questionId]: false }));
    }
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
    return Object.values(answers).filter((answer) => {
      if (!answer) return false;
      if (answer.type === "MCQ") {
        return answer.value !== undefined && answer.value !== "";
      }
      if (answer.type === "CODING") {
        return answer.code !== undefined && answer.code.trim() !== "";
      }
      return false;
    }).length;
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case "MCQ":
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer && answer.type === "MCQ" ? answer.value : ""}
              onValueChange={(value) =>
                handleAnswerChange(question.id, { type: "MCQ", value })
              }
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

      case "CODING":
        const questionResults = testResults[question.id] || [];
        const passedTests = questionResults.filter((r) => r.passed).length;
        const totalTests = questionResults.length;

        return (
          <div className="space-y-6">
            <Tabs defaultValue="problem" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="problem">Problem</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="problem" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {question.question}
                  </pre>
                </div>

                {question.testCases &&
                  question.testCases.filter((tc) => tc.isPublic).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <TestTube className="w-4 h-4" />
                        Sample Test Cases
                      </h4>
                      {question.testCases
                        .filter((tc) => tc.isPublic)
                        .map((testCase) => (
                          <Card key={testCase.id} className="p-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Input:
                                </Label>
                                <pre className="bg-white p-2 rounded border text-xs">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Expected Output:
                                </Label>
                                <pre className="bg-white p-2 rounded border text-xs">
                                  {testCase.expected}
                                </pre>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="solution" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      <span className="text-sm font-medium">Language:</span>
                    </div>
                    <Select
                      value={selectedLanguage[question.id] || "javascript"}
                      onValueChange={(value) =>
                        handleLanguageChange(question.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runCode(question.id)}
                      disabled={isRunning[question.id]}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isRunning[question.id] ? "Running..." : "Run"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitCode(question.id)}
                      disabled={isSubmittingCode[question.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmittingCode[question.id]
                        ? "Submitting..."
                        : "Submit"}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Textarea
                    value={code[question.id] || ""}
                    onChange={(e) =>
                      handleCodeChange(question.id, e.target.value)
                    }
                    className="min-h-[400px] font-mono text-sm border-0 resize-none"
                    placeholder="Write your code here..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {questionResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Test Results</h4>
                      <Badge
                        variant={
                          passedTests === totalTests ? "default" : "destructive"
                        }
                      >
                        {passedTests}/{totalTests} Passed
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {questionResults.map((result, index) => (
                        <Card key={result.testCaseId} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium">
                                Test Case {index + 1}
                              </span>
                              <Badge
                                variant={
                                  result.passed ? "default" : "destructive"
                                }
                              >
                                {result.passed ? "PASSED" : "FAILED"}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {result.executionTime}ms
                            </span>
                          </div>

                          {!result.passed && (
                            <div className="mt-2 space-y-2 text-xs">
                              <div>
                                <Label className="text-gray-500">
                                  Expected:
                                </Label>
                                <pre className="bg-gray-50 p-2 rounded mt-1">
                                  {result.expectedOutput}
                                </pre>
                              </div>
                              <div>
                                <Label className="text-gray-500">Actual:</Label>
                                <pre className="bg-gray-50 p-2 rounded mt-1">
                                  {result.actualOutput}
                                </pre>
                              </div>
                              {result.error && (
                                <div>
                                  <Label className="text-red-500">Error:</Label>
                                  <pre className="bg-red-50 p-2 rounded mt-1 text-red-600">
                                    {result.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run your code to see test results</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Test Not Found</CardTitle>
            <CardDescription>
              The requested test could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Test Submitted Successfully!</CardTitle>
            <CardDescription>
              Your answers have been saved and submitted for evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Questions Answered: {getAnsweredCount()}/
                {testData.questions.length}
              </p>
              <p className="text-sm text-gray-600">
                Time Used: {formatTime(testData.duration * 60 - timeRemaining)}
              </p>
              {violations.length > 0 && (
                <p className="text-sm text-orange-600">
                  Violations Detected: {violations.length}
                </p>
              )}
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

  const currentQuestion = testData.questions[currentQuestionIndex];
  const highViolations = violations.filter((v) => v.severity === "high").length;

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
                {getAnsweredCount()}/{testData.questions.length} Answered
              </Badge>

              {violations.length > 0 && (
                <Badge
                  variant={highViolations > 0 ? "destructive" : "secondary"}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {violations.length} Violations
                </Badge>
              )}

              <Button
                onClick={handleSubmit}
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

      {highViolations > 0 && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            Warning: {highViolations} high-severity violations detected. Your
            test may be flagged for review.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Question Navigation</CardTitle>
                  <Progress
                    value={
                      (getAnsweredCount() / testData.questions.length) * 100
                    }
                    className="h-2"
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {testData.questions.map(
                      (question: Question, index: number) => {
                        const answer = answers[question.id];
                        const isAnswered =
                          answer !== undefined &&
                          ((answer.type === "MCQ" &&
                            answer.value !== undefined &&
                            answer.value !== "") ||
                            (answer.type === "CODING" &&
                              answer.code !== undefined &&
                              answer.code.trim() !== ""));
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
                      }
                    )}
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Proctoring Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-24 bg-gray-100 rounded-lg object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge
                        variant={
                          proctoringStatus.camera ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {proctoringStatus.camera ? (
                          <Camera className="w-3 h-3" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                      </Badge>
                      <Badge
                        variant={
                          proctoringStatus.audio ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {proctoringStatus.audio ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <Mic className="w-3 h-3" />
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Face Detection:</span>
                      {proctoringStatus.faceDetected ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Audio Level:</span>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                            style={{
                              width: `${Math.min(
                                proctoringStatus.audioLevel * 2,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {violations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-600">
                        Recent Violations:
                      </h4>
                      <div className="max-h-16 overflow-y-auto space-y-1">
                        {violations.slice(-2).map((violation, index) => (
                          <Alert
                            key={index}
                            variant="destructive"
                            className="py-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              {violation.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1} of{" "}
                        {testData.questions.length}
                      </Badge>
                      <Badge>
                        {currentQuestion.marks}{" "}
                        {currentQuestion.marks === 1 ? "mark" : "marks"}
                      </Badge>
                      <Badge variant="secondary">{currentQuestion.type}</Badge>
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                      {currentQuestion.type === "MCQ"
                        ? currentQuestion.question
                        : "Coding Problem"}
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
                    {testData.questions.length}
                  </div>

                  {currentQuestionIndex < testData.questions.length - 1 ? (
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
                      onClick={handleSubmit}
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
