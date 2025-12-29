"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Settings } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google/auth-url")
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to fetch auth URL:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Manage your connections to external services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white">
                  G
                </div>
                <div>
                  <p className="font-medium">Google Account</p>
                  <p className="text-sm text-muted-foreground">Required for Calendar and Photos</p>
                </div>
              </div>
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? "Redirecting..." : "Login with Google"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

