"use client"

import { useState, useEffect } from "react"

export function ClientDate({ date }: { date: string | null }) {
  const [formatted, setFormatted] = useState<string>('');
  
  useEffect(() => {
    if (date) {
      setFormatted(new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      setFormatted('Unknown');
    }
  }, [date]);
  
  return <span>{formatted || 'Loading...'}</span>;
}
