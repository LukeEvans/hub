"use client"

import { Utensils, Clock, ChefHat, Search, Heart, Users, Flame, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { useApi } from "@/lib/use-api"

export default function RecipesPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: mealPlanData, isLoading: loading } = useApi<any>('/api/mealie/mealplan')
  const { data: selectedRecipe } = useApi<any>(
    selectedRecipeId ? `/api/mealie/recipe/${selectedRecipeId}` : null
  )

  const meals = mealPlanData?.mealPlan?.meals || []

  const filteredMeals = meals.filter((meal) => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--widget-pink)] flex items-center justify-center">
              <Utensils className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Meal Plan</h1>
              <p className="text-muted-foreground text-lg">Mealie Recipe Manager</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search planned meals..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recipes Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Planned Meals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <Card
              key={meal.recipeId}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => setSelectedRecipeId(meal.recipeId)}
            >
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{meal.name}</h3>
                <div className="text-sm text-muted-foreground">
                  Date: {meal.date}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={selectedRecipeId !== null} onOpenChange={() => setSelectedRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedRecipe.description && (
                  <p className="text-muted-foreground">{selectedRecipe.description}</p>
                )}
                
                <div className="flex gap-4 flex-wrap">
                  {selectedRecipe.totalTime && (
                    <Badge variant="secondary" className="text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedRecipe.totalTime}
                    </Badge>
                  )}
                  {selectedRecipe.recipeYield && (
                    <Badge variant="secondary" className="text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {selectedRecipe.recipeYield}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.recipeInstructions?.map((step: any, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span>{step.text}</span>
                      </li>
                    )) || <li>No instructions provided</li>}
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" size="lg">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Start Cook Mode
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
