"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGaugeProps {
  value: number
  min: number
  max: number
  label: string
  unit?: string
  color?: "blue" | "green" | "orange" | "purple"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function AnimatedGauge({
  value,
  min,
  max,
  label,
  unit = "",
  color = "blue",
  size = "md",
  showValue = true,
  className
}: AnimatedGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  const percentage = ((animatedValue - min) / (max - min)) * 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  // Calculate rotation for gauge (from -90deg to 90deg, representing 0-100%)
  const rotation = -90 + (clampedPercentage / 100) * 180

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
  }

  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-cyan-500",
      text: "text-blue-600 dark:text-blue-400",
      glow: "shadow-blue-500/50"
    },
    green: {
      gradient: "from-green-500 to-emerald-500",
      text: "text-green-600 dark:text-green-400",
      glow: "shadow-green-500/50"
    },
    orange: {
      gradient: "from-orange-500 to-amber-500",
      text: "text-orange-600 dark:text-orange-400",
      glow: "shadow-orange-500/50"
    },
    purple: {
      gradient: "from-purple-500 to-pink-500",
      text: "text-purple-600 dark:text-purple-400",
      glow: "shadow-purple-500/50"
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Gauge */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background arc */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Animated progress arc */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(clampedPercentage / 100) * 110} 110`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorClasses[color].glow})`
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn("transition-colors", `text-${color}-500`)} stopColor="currentColor" />
              <stop offset="100%" className={cn("transition-colors", `text-cyan-500`)} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <>
              <div className={cn(
                "text-2xl md:text-3xl font-bold transition-all duration-1000",
                colorClasses[color].text
              )}>
                {animatedValue.toFixed(1)}
              </div>
              {unit && (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {unit}
                </div>
              )}
            </>
          )}
        </div>

        {/* Needle indicator */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-gray-800 dark:bg-gray-200 origin-bottom transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(-50%, -100%) rotate(${rotation}deg)`
          }}
        >
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br",
            colorClasses[color].gradient
          )} />
        </div>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max: number
  label: string
  color?: "blue" | "green" | "orange" | "purple"
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  className?: string
}

export function CircularProgress({
  value,
  max,
  label,
  color = "blue",
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  const percentage = (animatedValue / max) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    blue: "stroke-blue-500 dark:stroke-blue-400",
    green: "stroke-green-500 dark:stroke-green-400",
    orange: "stroke-orange-500 dark:stroke-orange-400",
    purple: "stroke-purple-500 dark:stroke-purple-400"
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000 ease-out", colorClasses[color])}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {animatedValue}
          </div>
          {showPercentage && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {percentage.toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
        {label}
      </div>
    </div>
  )
}
