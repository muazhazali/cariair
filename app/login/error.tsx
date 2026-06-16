// ==========================================
// Login Page Error Boundary
// ==========================================

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";

interface LoginErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LoginError({ error, reset }: LoginErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center"
>
      <div className="text-center space-y-4 px-4"
>
        <div className="flex justify-center"
>
          <ShieldAlert className="w-12 h-12 text-destructive" /
>
        </div
>
        <h1 className="text-2xl font-bold"
>Authentication Error</h1
>
        <p className="text-muted-foreground"
>
          We encountered an error while loading the login page. Please try again.
        </p
>
        <div className="flex gap-3 justify-center"
>
          <Button variant="outline" asChild
>
            <Link href="/"
>
              <ArrowLeft className="mr-2 h-4 w-4" /
>
              Back to Home
            </Link
>
          </Button
>
          <Button onClick={() => reset()}
>
            <RefreshCw className="mr-2 h-4 w-4" /
>
            Try Again
          </Button
>
        </div
>
      </div
>
    </div
>
  );
}
