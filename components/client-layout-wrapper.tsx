"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DataProvider from "@/components/data-provider"

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we only render on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return <DataProvider>{children}</DataProvider>
}
