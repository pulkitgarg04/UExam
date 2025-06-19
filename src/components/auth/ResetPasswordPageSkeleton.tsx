import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const SkeletonLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-md shadow-xl border-0">
      <CardContent className="text-center py-8">
        <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Loading...
        </h2>
        <p className="text-gray-600">Please wait while the content loads.</p>
      </CardContent>
    </Card>
  </div>
);