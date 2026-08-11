"use client"

import { HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WaterMetricsHelpProps {
  translations: {
    trigger: string
    title: string
    phTitle: string
    phDesc: string
    phAcidic: string
    phNeutral: string
    phAlkaline: string
    tdsTitle: string
    tdsDesc: string
    tdsLow: string
    tdsMedium: string
    tdsHigh: string
  }
}

export function WaterMetricsHelp({ translations }: WaterMetricsHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          {translations.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* pH */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base">{translations.phTitle}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {translations.phDesc}
            </p>
            <ul className="space-y-1 pt-1">
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span>{translations.phAcidic}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>{translations.phNeutral}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>{translations.phAlkaline}</span>
              </li>
            </ul>
          </div>

          {/* TDS */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base">{translations.tdsTitle}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {translations.tdsDesc}
            </p>
            <ul className="space-y-1 pt-1">
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span>{translations.tdsLow}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>{translations.tdsMedium}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>{translations.tdsHigh}</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}