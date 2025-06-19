import React, { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordClient";
import { SkeletonLoader } from "@/components/auth/ResetPasswordPageSkeleton";

export default function ResetPasswordSuspense() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <ResetPasswordPage />
    </Suspense>
  );
}