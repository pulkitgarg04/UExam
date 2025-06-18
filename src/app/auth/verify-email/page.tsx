import { Suspense } from "react";
import VerifyEmailPage from "@/components/auth/VerifyEmailClient";

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">Loading email verification...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}