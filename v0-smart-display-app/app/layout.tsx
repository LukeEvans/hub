import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { TouchScrollProvider } from "@/components/touch-scroll-provider"
import { Screensaver } from "@/components/screensaver"
import { VirtualKeyboardProvider } from "@/components/virtual-keyboard-context"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { SWRProvider } from "@/lib/swr-provider"
import { TimerProvider } from "@/lib/timer-context"
import { TimerBar } from "@/components/timer-bar"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Home Display",
  description: "Family countertop display with calendar, weather, photos, recipes, music, and smart home controls",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <SWRProvider>
          <TimerProvider>
            <VirtualKeyboardProvider>
              <TouchScrollProvider />
              <Screensaver />
              <SidebarNavigation />
              <TimerBar />
              <main>
                {children}
              </main>
              
              {/* Floating Hub Return Button - Visible when browsing external sites like Mealie */}
              <Link href="/" className="fixed bottom-6 right-6 z-[100] transition-transform active:scale-95">
                <Button size="icon" className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-4 border-background">
                  <Home className="w-7 h-7" />
                </Button>
              </Link>
              
              <VirtualKeyboard />
              <Toaster position="top-right" />
            </VirtualKeyboardProvider>
          </TimerProvider>
        </SWRProvider>
        <Analytics />
      </body>
    </html>
  )
}
