"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("resend");
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken, email }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus("success");
        setMessage("Your email has been successfully verified!");
      } else {
        setStatus("error");
        setMessage(data.error || "Invalid or expired verification token.");
      }
    } catch (error) {
      console.log(error);
      setStatus("error");
      setMessage("An error occurred during verification.");
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage("Email address is required to resend verification.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "User" }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        setMessage(data.error || "Failed to resend verification email.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          {status === "loading" && <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />}
          {status === "success" && <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />}
          {status === "error" && <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
          {status === "resend" && <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />}

          <CardTitle>
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "resend" && "Verify Your Email"}
          </CardTitle>

          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address."}
            {status === "success" && "You can now sign in to your account."}
            {status === "error" && "There was a problem verifying your email."}
            {status === "resend" && "We need to verify your email address to continue."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Success View */}
          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Welcome to UExam!</h4>
                <p className="text-green-800 text-sm">
                  Your email has been verified successfully. You now have access to all UExam features.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Continue to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Error View */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Verification Failed</h4>
                <p className="text-red-800 text-sm mb-3">
                  The verification link may have expired or is invalid. You can request a new verification email below.
                </p>
                <ul className="text-red-800 text-xs space-y-1">
                  <li>• Verification links expire after 24 hours</li>
                  <li>• Each link can only be used once</li>
                  <li>• Check your spam folder for the email</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Button onClick={() => resendVerification()} className="w-full" disabled={isResending}>
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification
                    </>
                  )}
                </Button>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Resend View */}
          {status === "resend" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Email Verification Required</h4>
                <p className="text-blue-800 text-sm">
                  To ensure account security and enable all features, please verify your email address.
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => resendVerification()} className="w-full" disabled={isResending || !email}>
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
                {email ? (
                  <p className="text-sm text-gray-600 text-center">
                    We&apos;ll send a verification link to: <strong>{email}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 text-center">
                    Email address is required to send verification
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Need help with verification?</p>
              <div className="flex justify-center space-x-4 text-xs">
                <a href="mailto:project.pulkitgarg@gmail.com" className="text-blue-600 hover:text-blue-500">
                  Email Support
                </a>
                <span className="text-gray-300">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}