"use client";

import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button
        className="w-full max-w-xs flex items-center justify-center"
        onClick={() => router.push("/dashboard")}
      >
        <Home className="mr-2 h-4 w-4" />
        Go to Dashboard
      </Button>
    </div>
  );
}


