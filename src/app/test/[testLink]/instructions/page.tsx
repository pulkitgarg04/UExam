"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Camera,
  Mic,
  Shield,
  FileText,
  Calendar,
  Maximize,
  Play,
  Square,
  Volume2,
  Eye,
  Wifi,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"

interface TestData {
  title: string;
  subject: string;
  department: string;
  date: string;
  duration: number;
  questions?: { id: string; text: string }[];
  totalMarks: number;
  degree: string;
  studentYear: string;
}

export default function TestInstructions() {
  const params = useParams<{ testLink: string }>()
  const router = useRouter()
  const [testData, setTestData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [systemCheck, setSystemCheck] = useState({
    camera: false,
    microphone: false,
    fullscreen: false,
    internet: true,
  })
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [agreements, setAgreements] = useState({
    terms: false,
    proctoring: false,
    conduct: false,
    technical: false,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    fetchTestData()
    checkFullscreenSupport()
    checkInternetConnection()

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [params?.testLink])

  const fetchTestData = async () => {
    try {
      const response = await fetch(`/api/tests/link/${params?.testLink}`)
      const data = await response.json()
      setTestData(data.test)
    } catch (error) {
      console.error("Error fetching test:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkFullscreenSupport = () => {
    setSystemCheck((prev) => ({
      ...prev,
      fullscreen: !!document.documentElement.requestFullscreen,
    }))
  }

  const checkInternetConnection = () => {
    setSystemCheck((prev) => ({
      ...prev,
      internet: navigator.onLine,
    }))
  }

  const startMediaCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      })

      setMediaStream(stream)
      setIsRecording(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setupAudioMonitoring(stream)

      setSystemCheck((prev) => ({
        ...prev,
        camera: true,
        microphone: true,
      }))
    } catch (error) {
      console.error("Error accessing media:", error)
      setSystemCheck((prev) => ({
        ...prev,
        camera: false,
        microphone: false,
      }))
    }
  }

  const stopMediaCapture = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsRecording(false)
    setAudioLevel(0)
  }

  const setupAudioMonitoring = (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    microphone.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    monitorAudioLevel()
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const checkAudio = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average)

      requestAnimationFrame(checkAudio)
    }

    checkAudio()
  }

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } catch (error) {
      console.error("Failed to enter fullscreen:", error)
    }
  }

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen()
      setIsFullscreen(false)
    } catch (error) {
      console.error("Failed to exit fullscreen:", error)
    }
  }

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }))
  }

  const allAgreementsChecked = Object.values(agreements).every(Boolean)
  const allSystemChecksPass =
    systemCheck.camera && systemCheck.microphone && systemCheck.fullscreen && systemCheck.internet

  const startTest = async () => {
    if (!allAgreementsChecked || !allSystemChecksPass) {
      alert("Please complete all requirements before starting the test.")
      return
    }

    if (!isFullscreen) {
      await enterFullscreen()
    }

    router.push(`/test/${params?.testLink}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test instructions...</p>
        </div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Test Not Found</CardTitle>
            <CardDescription>The requested test could not be found or may have expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? "bg-black" : ""}`}>
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{testData.title}</h1>
                <p className="text-gray-600">
                  {testData.subject} • {testData.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                {systemCheck.internet ? "Online" : "Offline"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                className="flex items-center gap-2"
              >
                <Maximize className="w-4 h-4" />
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Date & Time:</strong> {formatDate(testData.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Duration:</strong> {testData.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Questions:</strong> {testData.questions?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <strong>Total Marks:</strong> {testData.totalMarks}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Target Audience</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{testData.degree}</Badge>
                    <Badge variant="secondary">{testData.studentYear}</Badge>
                    <Badge variant="secondary">{testData.department}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2">Before Starting</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ensure stable internet connection throughout the test</li>
                      <li>• Close all unnecessary applications and browser tabs</li>
                      <li>• Keep your student ID and necessary materials ready</li>
                      <li>• Ensure your device is fully charged or plugged in</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 mb-2">During the Test</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• You have {testData.duration} minutes to complete the test</li>
                      <li>• Navigate between questions using the question panel</li>
                      <li>• Flag questions for review if needed</li>
                      <li>• Your progress is automatically saved</li>
                      <li>• The test will auto-submit when time expires</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-semibold text-red-900 mb-2">Proctoring Rules</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Your camera and microphone will be monitored</li>
                      <li>• Stay visible in the camera frame at all times</li>
                      <li>• Do not leave your seat without permission</li>
                      <li>• No talking or communication with others</li>
                      <li>• Exiting fullscreen mode is not allowed</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-900 mb-2">Technical Guidelines</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Do not refresh the browser page</li>
                      <li>• Do not use browser back/forward buttons</li>
                      <li>• Report technical issues immediately</li>
                      <li>• Keep your face clearly visible in the camera</li>
                      <li>• Ensure good lighting in your room</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms and Agreements</CardTitle>
                <CardDescription>Please read and agree to all terms before proceeding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={(checked) => handleAgreementChange("terms", checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed">
                      I have read and agree to the <strong>Terms and Conditions</strong>. I understand that this is a
                      proctored examination and my actions will be monitored.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="proctoring"
                      checked={agreements.proctoring}
                      onCheckedChange={(checked) => handleAgreementChange("proctoring", checked as boolean)}
                    />
                    <label htmlFor="proctoring" className="text-sm leading-relaxed">
                      I consent to <strong>video and audio monitoring</strong> during the examination. I understand that
                      my camera and microphone will be active throughout the test.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="conduct"
                      checked={agreements.conduct}
                      onCheckedChange={(checked) => handleAgreementChange("conduct", checked as boolean)}
                    />
                    <label htmlFor="conduct" className="text-sm leading-relaxed">
                      I agree to maintain <strong>academic integrity</strong> and will not use unauthorized materials,
                      communicate with others, or engage in any form of cheating.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="technical"
                      checked={agreements.technical}
                      onCheckedChange={(checked) => handleAgreementChange("technical", checked as boolean)}
                    />
                    <label htmlFor="technical" className="text-sm leading-relaxed">
                      I understand the <strong>technical requirements</strong> and confirm that my system meets all
                      specifications. I will not exit fullscreen mode during the test.
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera & Audio Test
                </CardTitle>
                <CardDescription>Test your camera and microphone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <video ref={videoRef} autoPlay muted className="w-full h-32 bg-gray-100 rounded-lg object-cover" />
                  {!isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Audio Level:</span>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button onClick={startMediaCapture} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Start Test
                    </Button>
                  ) : (
                    <Button onClick={stopMediaCapture} variant="destructive" className="flex-1">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Check
                </CardTitle>
                <CardDescription>Verify system requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Camera Access</span>
                    </div>
                    {systemCheck.camera ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">Microphone Access</span>
                    </div>
                    {systemCheck.microphone ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm">Fullscreen Support</span>
                    </div>
                    {systemCheck.fullscreen ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm">Internet Connection</span>
                    </div>
                    {systemCheck.internet ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                {!allSystemChecksPass && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      Please resolve all system requirements before starting the test.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                <CardDescription>Complete all requirements to begin</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={startTest}
                  disabled={!allAgreementsChecked || !allSystemChecksPass}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Start Proctored Test
                </Button>

                {(!allAgreementsChecked || !allSystemChecksPass) && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Complete all requirements above to start the test
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}