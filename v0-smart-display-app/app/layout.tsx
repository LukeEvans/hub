import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { TouchScrollProvider } from "@/components/touch-scroll-provider"
import { Screensaver } from "@/components/screensaver"
import { PowerManager } from "@/components/power-manager"
import { VirtualKeyboardProvider } from "@/components/virtual-keyboard-context"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { SWRProvider } from "@/lib/swr-provider"
import { TimerProvider } from "@/lib/timer-context"
import { OrientationProvider } from "@/lib/orientation-context"
import { TimerBar } from "@/components/timer-bar"
import { Toaster } from "sonner"
import { LoadingScreen } from "@/components/loading-screen"

const inter = Inter({ subsets: ["latin"] })
// ...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <SWRProvider>
          <OrientationProvider>
            <TimerProvider>
              <VirtualKeyboardProvider>
                <LoadingScreen />
                <TouchScrollProvider />
                <Screensaver />
                <PowerManager />
                <SidebarNavigation />
                <TimerBar />
                <main>
                  {children}
                </main>

                <VirtualKeyboard />
                <Toaster position="top-right" />
              </VirtualKeyboardProvider>
            </TimerProvider>
          </OrientationProvider>
        </SWRProvider>
        <Analytics />
      </body>
    </html>
  )
}
