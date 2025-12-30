"use client"

import { Calendar, Cloud, ImageIcon, Utensils, Music, HomeIcon, LayoutDashboard, Moon, Sun, Settings, Trophy } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
    name: "Sports",
    href: "/sports",
    icon: Trophy,
    label: "Sports",
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
    label: "Smart Home",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
]

export function SidebarNavigation() {
  const pathname = usePathname()
  const router = useRouter()
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
    <aside className="fixed left-0 top-0 h-screen w-28 border-r border-sidebar-border bg-sidebar flex flex-col items-center py-6 gap-6">
      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-3 w-full px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "w-full aspect-square min-h-20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
                "active:bg-sidebar-primary active:text-sidebar-primary-foreground active:scale-95",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "hover:bg-sidebar-accent",
              )}
              aria-label={item.label}
              draggable={false}
              onClick={(e) => {
                e.preventDefault()
                router.push(item.href)
              }}
            >
              <Icon className="w-8 h-8" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Dark Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="w-14 h-14 rounded-xl"
        title="Toggle dark mode"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </Button>
    </aside>
  )
}
