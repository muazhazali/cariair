import { Badge } from "@/components/ui/badge"
import { getWaterTypeBadgeClass } from "@/lib/water-type-colors"
import {
    Mountain,
    Waves,
    Building2,
    Zap,
    Sparkles,
    GlassWater,
    Droplet
} from "lucide-react"

const WATER_TYPE_ICONS: Record<string, any> = {
    Underground: Mountain,
    Spring: Waves,
    Municipal: Building2,
    Oxygenated: Zap,
    Mineral: Sparkles,
    Drinking: GlassWater,
}

interface WaterTypeBadgeProps {
    type: string | undefined | null
    className?: string
}

export function WaterTypeBadge({ type, className }: WaterTypeBadgeProps) {
    // Case-insensitive lookup for the icon
    const getIcon = (t: string | undefined | null) => {
        if (!t) return Droplet

        // Exact match
        if (WATER_TYPE_ICONS[t]) return WATER_TYPE_ICONS[t]

        // Case-insensitive match
        const lowercaseType = t.toLowerCase()
        const match = Object.entries(WATER_TYPE_ICONS).find(
            ([key]) => key.toLowerCase() === lowercaseType
        )

        return match ? match[1] : Droplet
    }

    const Icon = getIcon(type)
    const colorClass = getWaterTypeBadgeClass(type)

    return (
        <Badge
            variant="outline"
            className={`${colorClass} ${className} flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium transition-all hover:opacity-80`}
        >
            <Icon className="h-3 w-3" />
            <span>{type || "Unknown"}</span>
        </Badge>
    )
}
