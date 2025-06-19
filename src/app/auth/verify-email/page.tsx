import { Suspense } from "react";
import VerifyEmailPage from "@/components/auth/VerifyEmailClient";
import VerifyEmailSkeleton from "@/components/auth/VerifyEmailSkeleton";

export default function VerifyEmail() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
