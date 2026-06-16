// ==========================================
// Docs Page Error Boundary
// ==========================================

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, BookOpen } from "lucide-react";

interface DocsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DocsError({ error, reset }: DocsErrorProps) {
  return (
    <div className="container px-4 py-12"
>
      <div className="text-center space-y-4"
>
        <div className="flex justify-center"
>
          <BookOpen className="w-12 h-12 text-muted-foreground" /
>
        </div
>
        <h1 className="text-2xl font-bold"
>Documentation Unavailable</h1
>
        <p className="text-muted-foreground"
>
          We couldn&apos;t load the documentation. Please try again.
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
