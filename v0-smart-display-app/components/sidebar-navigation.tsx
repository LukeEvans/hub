"use client"

import { Calendar, Cloud, ImageIcon, Utensils, Music, HomeIcon, LayoutDashboard, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    label: "Home",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    label: "Calendar",
  },
  {
    name: "Weather",
    href: "/weather",
    icon: Cloud,
    label: "Weather",
  },
  {
    name: "Photos",
    href: "/photos",
    icon: ImageIcon,
    label: "Photos",
  },
  {
    name: "Recipes",
    href: "/recipes",
    icon: Utensils,
    label: "Mealie",
  },
  {
    name: "Music",
    href: "/music",
    icon: Music,
    label: "Spotify",
  },
  {
    name: "Smart Home",
    href: "/home",
    icon: HomeIcon,
    label: "Home",
  },
]

export function SidebarNavigation() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference on mount
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 border-r border-sidebar-border bg-sidebar flex flex-col items-center py-6 gap-6">
      {/* Logo/Brand */}
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
        H
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-3 w-full px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
              )}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Dark Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="w-12 h-12 rounded-xl"
        title="Toggle dark mode"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </aside>
  )
}
