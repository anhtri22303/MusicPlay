import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayoutWrapper from "@/components/client-layout-wrapper"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Music Player App",
  description: "A simple music player application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'