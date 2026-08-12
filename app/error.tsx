"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { EditorialErrorState } from "@/components/editorial-error-state"

export default function RootErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
<<<<<<< HEAD
  const t = useTranslations("error")
=======
  const t = useTranslations("errors")
>>>>>>> 6f557c3b1bd383c199fae316538638869229d90b
  useEffect(() => { if (process.env.NODE_ENV === "production") console.error("Root error boundary caught:", error) }, [error])
  return <EditorialErrorState title={t("genericTitle")} description={t("genericDescription")} reset={reset} />
}
