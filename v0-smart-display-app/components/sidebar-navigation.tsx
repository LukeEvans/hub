"use client"

import { Calendar, Cloud, ImageIcon, Utensils, Music, HomeIcon, LayoutDashboard, Moon, Sun, Settings, Trophy, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useOrientation } from "@/lib/orientation-context"

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
  const { orientation } = useOrientation()
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
        className={cn(
          "fixed top-4 left-4 z-[60] md:hidden w-12 h-12 rounded-xl bg-sidebar/80 backdrop-blur-sm border border-sidebar-border shadow-sm",
          orientation === 'portrait' && "hidden"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Backdrop Overlay */}
      {isOpen && orientation !== 'portrait' && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      <aside className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out bg-sidebar border-sidebar-border",
        orientation === 'landscape' 
          ? "left-0 top-0 h-screen w-64 md:w-28 border-r flex flex-col items-center py-6 gap-6" 
          : "left-0 bottom-0 w-full h-20 border-t flex flex-row items-center px-4 gap-2",
        orientation === 'landscape' && !isOpen && "-translate-x-full md:translate-x-0"
      )}>
        {/* Navigation Items */}
        <nav className={cn(
          "flex items-center w-full",
          orientation === 'landscape' ? "flex-1 flex-col gap-3 px-3" : "flex-row justify-around h-full"
        )}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "rounded-2xl flex flex-col items-center justify-center transition-all duration-200",
                  orientation === 'landscape' 
                    ? "w-full min-h-20 md:aspect-square gap-2" 
                    : "h-full px-2 gap-1 flex-1 min-w-0",
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
                <Icon className={cn(orientation === 'landscape' ? "w-8 h-8" : "w-6 h-6")} />
                <span className={cn(
                  "font-medium truncate w-full text-center px-1",
                  orientation === 'landscape' ? "text-xs" : "text-[10px]"
                )}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={cn(
          "flex items-center gap-2",
          orientation === 'landscape' ? "mt-auto flex-col pb-6" : ""
        )}>
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={cn(
              "rounded-xl",
              orientation === 'landscape' ? "w-14 h-14" : "w-12 h-12"
            )}
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </Button>
        </div>
      </aside>
    </>
  )
}
