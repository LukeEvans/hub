"use client"

import { Utensils, Clock, ChefHat, Search, Heart, Users, Flame, Loader2, ChevronLeft, ChevronRight, BookOpen, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useMemo } from "react"
import { useApi } from "@/lib/use-api"
import { parseSafeDate } from "@/lib/utils"

export default function RecipesPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [recipePage, setRecipePage] = useState(1)
  const recipesPerPage = 12
  
  const { data: mealPlanData, isLoading: loadingPlan } = useApi<any>('/api/mealie/mealplan')
  const { data: recipesData, isLoading: loadingRecipes } = useApi<any>(
    `/api/mealie/recipes?page=${recipePage}&perPage=${recipesPerPage}&search=${searchQuery}`
  )
  const { data: selectedRecipe } = useApi<any>(
    selectedRecipeId ? `/api/mealie/recipe/${selectedRecipeId}` : null
  )

  const meals = mealPlanData?.mealPlan?.meals || []
  
  // Find tonight's dinner
  const today = new Date().toDateString()
  const tonightDinner = meals.find((meal: any) => parseSafeDate(meal.date).toDateString() === today)
  
  // Filter meals for the rest of the week (excluding today)
  const weeklyPlan = meals.filter((meal: any) => parseSafeDate(meal.date).toDateString() !== today)
    .sort((a: any, b: any) => parseSafeDate(a.date).getTime() - parseSafeDate(b.date).getTime())

  const allRecipes = recipesData?.items || []
  const totalRecipes = recipesData?.total || 0
  const totalPages = Math.ceil(totalRecipes / recipesPerPage)

  const handleRecipeClick = (recipeId: string) => {
    setSelectedRecipeId(recipeId)
  }

  if (loadingPlan && recipePage === 1 && !searchQuery) {
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
              <h1 className="text-4xl font-bold">Mealie Recipes</h1>
              <p className="text-muted-foreground text-lg">Manage your meals and recipes</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search all recipes..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setRecipePage(1) // Reset to first page on search
            }}
          />
        </div>
      </div>

      <div className="space-y-12">
        {/* Tonight's Dinner Section */}
        {tonightDinner && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-[var(--widget-pink)]" />
              <h2 className="text-2xl font-bold">Tonight's Dinner</h2>
            </div>
            <Card 
              className="p-6 bg-gradient-to-r from-[var(--widget-pink)]/20 to-transparent border-l-4 border-l-[var(--widget-pink)] cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleRecipeClick(tonightDinner.recipeId)}
            >
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={`/api/mealie/image/${tonightDinner.recipeId}`} 
                    alt={tonightDinner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg'
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{tonightDinner.name}</h3>
                  <p className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    {tonightDinner.mealType || 'Dinner'}
                  </p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Weekly Plan Section */}
        {weeklyPlan.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Weekly Plan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyPlan.map((meal: any) => (
                <Card 
                  key={meal.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-all flex flex-col gap-3"
                  onClick={() => handleRecipeClick(meal.recipeId)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {parseSafeDate(meal.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">{meal.mealType}</Badge>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={`/api/mealie/image/${meal.recipeId}`} 
                        alt={meal.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg'
                        }}
                      />
                    </div>
                    <h3 className="font-bold text-sm line-clamp-2">{meal.name}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Browse All Recipes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Browse All Recipes</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={recipePage === 1}
                onClick={() => setRecipePage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {recipePage} of {totalPages || 1}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                disabled={recipePage === totalPages}
                onClick={() => setRecipePage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingRecipes ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {allRecipes.map((recipe: any) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col h-full"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img 
                      src={`/api/mealie/image/${recipe.id}`} 
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 flex-1">{recipe.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <Clock className="w-3 h-3" />
                      {recipe.totalTime || '30m'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loadingRecipes && allRecipes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground italic">
              No recipes found
            </div>
          )}
        </section>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={selectedRecipeId !== null} onOpenChange={() => setSelectedRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedRecipe && (
            <div className="relative">
              {/* Hero Image */}
              <div className="h-64 w-full relative overflow-hidden">
                <img 
                  src={`/api/mealie/image/${selectedRecipe.id}`} 
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedRecipe.name}</h2>
                  <div className="flex gap-4">
                    {selectedRecipe.totalTime && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedRecipe.totalTime}
                      </Badge>
                    )}
                    {selectedRecipe.recipeYield && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md">
                        <Users className="w-4 h-4 mr-1" />
                        {selectedRecipe.recipeYield}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {selectedRecipe.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
                    {selectedRecipe.description}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Ingredients */}
                  <div className="md:col-span-1">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {selectedRecipe.recipeIngredient?.map((ing: any, idx: number) => (
                        <li key={idx} className="text-sm border-b border-muted pb-2">
                          <span className="font-medium text-foreground">{ing.note}</span>
                        </li>
                      )) || <li className="text-muted-foreground">No ingredients listed</li>}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Instructions
                    </h3>
                    <ol className="space-y-4">
                      {selectedRecipe.recipeInstructions?.map((step: any, idx: number) => (
                        <li key={idx} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--widget-pink)] text-foreground flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-foreground leading-relaxed">{step.text}</span>
                        </li>
                      )) || <li className="text-muted-foreground">No instructions provided</li>}
                    </ol>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 h-14 text-lg" size="lg">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Start Cook Mode
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!selectedRecipe && selectedRecipeId && (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
