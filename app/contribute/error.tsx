// ==========================================
// Contribute Page Error Boundary
// ==========================================

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, HeartHandshake } from "lucide-react";

interface ContributeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ContributeError({ error, reset }: ContributeErrorProps) {
  return (
    <div className="container px-4 py-12"
>
      <div className="text-center space-y-4"
>
        <div className="flex justify-center"
>
          <HeartHandshake className="w-12 h-12 text-muted-foreground" /
>
        </div
>
        <h1 className="text-2xl font-bold"
>Failed to Load Contribution Page</h1
>
        <p className="text-muted-foreground"
>
          We couldn&apos;t load the contribution page. Please try again.
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
