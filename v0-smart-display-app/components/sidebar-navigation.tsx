"use client"

import { Calendar, Cloud, ImageIcon, Utensils, Music, HomeIcon, LayoutDashboard, Moon, Sun, Settings, Trophy, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"

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
    name: "Meals",
    href: "/recipes",
    icon: Utensils,
    label: "Meals",
  },
  /* {
    name: "Music",
    href: "/music",
    icon: Music,
    label: "Spotify",
  }, */
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
  const [isOpen, setIsOpen] = useState(false)

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

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    // Close menu on navigation
    closeMenu()
  }, [pathname, closeMenu])

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-[60] md:hidden w-12 h-12 rounded-xl bg-sidebar/80 backdrop-blur-sm border border-sidebar-border shadow-sm"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 md:w-28 border-r border-sidebar-border bg-sidebar flex flex-col items-center py-6 gap-6 z-50 transition-transform duration-300 ease-in-out",
        !isOpen && "-translate-x-full md:translate-x-0"
      )}>
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
                  "w-full min-h-20 md:aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
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
                  closeMenu()
                }}
              >
                <Icon className="w-8 h-8" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center gap-2 pb-6">
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
        </div>
      </aside>
    </>
  )
}
