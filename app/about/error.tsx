"use client"
import { useTranslations } from "next-intl"
import { EditorialErrorState } from "@/components/editorial-error-state"
<<<<<<< HEAD
export default function AboutError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("error")
  return <EditorialErrorState title={t("aboutTitle")} description={t("aboutDescription")} reset={reset} />
}
=======
export default function AboutError({ reset }: { error: Error; reset: () => void }) { const t = useTranslations("errors"); return <EditorialErrorState title={t("aboutTitle")} description={t("aboutDescription")} reset={reset} /> }
>>>>>>> 6f557c3b1bd383c199fae316538638869229d90b
