"use client"

import { Utensils, Clock, ChefHat, Search, Heart, Users, Flame, Loader2, ChevronLeft, ChevronRight, BookOpen, Calendar, Link, Plus, ShoppingBasket, Check, Trash2, MoreVertical, Edit2, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, useMemo, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { parseSafeDate } from "@/lib/utils"
import axios from "axios"
import { toast } from "sonner"
import { mutate } from "swr"
import { useRouter } from "next/navigation"

export default function RecipesPage() {
  const router = useRouter()
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recipePage, setRecipePage] = useState(1)
  const [parseUrl, setParseUrl] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [showIngredientsList, setShowIngredientsList] = useState(false)
  const [planningRecipe, setPlanningRecipe] = useState<any>(null)
  const [editingMeal, setEditingMeal] = useState<any>(null)
  const recipesPerPage = 12
  
  const { data: mealPlanData, isLoading: loadingPlan } = useApi<any>('/api/mealplan')
  const { data: recipesData, isLoading: loadingRecipes } = useApi<any>(
    `/api/recipes?page=${recipePage}&perPage=${recipesPerPage}&search=${searchQuery}`
  )
  const { data: selectedRecipe } = useApi<any>(
    selectedRecipeId ? `/api/recipes?id=${selectedRecipeId}` : null
  )

  const meals = mealPlanData?.meals || []
  
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

  const handleParseRecipe = async () => {
    if (!parseUrl) return
    setIsParsing(true)
    try {
      const response = await axios.post('/api/recipes/parse', { url: parseUrl })
      const recipe = response.data
      await axios.post('/api/recipes', recipe)
      toast.success("Recipe added successfully!")
      setParseUrl("")
      mutate((key: string) => key.startsWith('/api/recipes'))
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to parse recipe")
    } finally {
      setIsParsing(false)
    }
  }

  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this recipe?")) return
    try {
      await axios.delete(`/api/recipes?id=${id}`)
      toast.success("Recipe deleted")
      mutate((key: string) => key.startsWith('/api/recipes'))
      if (selectedRecipeId === id) setSelectedRecipeId(null)
    } catch (error: any) {
      toast.error("Failed to delete recipe")
    }
  }

  const handleAddToPlan = async (recipe: any, date: string, mealType: string) => {
    try {
      await axios.post('/api/mealplan', {
        recipeId: recipe.id,
        date,
        mealType
      })
      toast.success("Added to meal plan")
      mutate('/api/mealplan')
      setPlanningRecipe(null)
    } catch (error) {
      toast.error("Failed to add to plan")
    }
  }

  const handleUpdateMeal = async (mealId: string, date: string, mealType: string) => {
    try {
      const meal = meals.find((m: any) => m.id === mealId)
      await axios.put('/api/mealplan', {
        ...meal,
        date,
        mealType
      })
      toast.success("Meal updated")
      mutate('/api/mealplan')
      setEditingMeal(null)
    } catch (error) {
      toast.error("Failed to update meal")
    }
  }

  const handleShiftMeal = async (meal: any, direction: 'left' | 'right') => {
    try {
      const date = parseSafeDate(meal.date)
      date.setDate(date.getDate() + (direction === 'left' ? -1 : 1))
      await axios.put('/api/mealplan', {
        ...meal,
        date: date.toISOString().split('T')[0]
      })
      toast.success("Meal moved")
      mutate('/api/mealplan')
    } catch (error) {
      toast.error("Failed to move meal")
    }
  }

  const handleRemoveFromPlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/mealplan?id=${id}`)
      toast.success("Removed from plan")
      mutate('/api/mealplan')
    } catch (error) {
      toast.error("Failed to remove from plan")
    }
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
              <h1 className="text-4xl font-bold">Smart Meals</h1>
              <p className="text-muted-foreground text-lg">Your AI-powered kitchen companion</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setShowIngredientsList(true)}>
              <ShoppingBasket className="w-5 h-5 mr-2" />
              Grocery List
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-10 h-12 rounded-xl"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setRecipePage(1)
              }}
            />
          </div>
          
          {/* Import Bar */}
          <div className="flex gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Paste recipe URL (e.g. NYT Cooking)..."
                className="pl-10 h-12 rounded-xl"
                value={parseUrl}
                onChange={(e) => setParseUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParseRecipe()}
              />
            </div>
            <Button 
              className="h-12 px-6 rounded-xl" 
              onClick={handleParseRecipe}
              disabled={isParsing || !parseUrl}
            >
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              Import
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Weekly Meal Planning Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Weekly Meal Plan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() + i)
              const dateStr = date.toISOString().split('T')[0]
              const isToday = i === 0
              const dayName = date.toLocaleDateString([], { weekday: 'short' })
              const dayMeals = meals.filter((m: any) => m.date.split('T')[0] === dateStr)

              return (
                <div key={dateStr} className="flex flex-col gap-3">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex justify-between items-center px-1 ${isToday ? 'text-blue-500' : 'text-muted-foreground'}`}>
                    <span>{isToday ? 'Today' : dayName}</span>
                    <span className="opacity-60 font-medium">{date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-h-[200px]">
                    {dayMeals.length === 0 ? (
                      <div className="flex-1 border-2 border-dashed border-muted rounded-2xl flex items-center justify-center p-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-medium italic">Empty</p>
                      </div>
                    ) : (
                      dayMeals.map((meal: any) => (
                        <Card 
                          key={meal.id} 
                          className="p-3 cursor-pointer hover:shadow-md transition-all flex flex-col gap-2 group relative border-none bg-muted/40"
                          onClick={() => handleRecipeClick(meal.recipeId)}
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img 
                              src={meal.imageUrl || '/placeholder.jpg'} 
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[11px] line-clamp-2 leading-tight mb-1">{meal.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">{meal.mealType || 'Dinner'}</span>
                            </div>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1 px-2">
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShiftMeal(meal, 'left')
                              }}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingMeal(meal)
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-7 w-7 rounded-full text-destructive"
                              onClick={(e) => handleRemoveFromPlan(meal.id, e)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShiftMeal(meal, 'right')
                              }}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Browse All Recipes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Your Cookbook</h2>
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
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col h-full relative"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img 
                      src={recipe.imageUrl || '/placeholder.jpg'} 
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPlanningRecipe(recipe)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full shadow-lg text-destructive"
                        onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
            <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-2xl border-2 border-dashed">
              No recipes found. Import one from the top to get started!
            </div>
          )}
        </section>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={selectedRecipeId !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedRecipeId(null)
          setShowOriginal(false)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedRecipe && (
            <div className="flex flex-col">
              {/* Hero Image */}
              <div className="h-64 w-full relative overflow-hidden">
                <img 
                  src={selectedRecipe.imageUrl || '/placeholder.jpg'} 
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedRecipe.name}</h2>
                    <div className="flex gap-3">
                      {selectedRecipe.totalTime && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 text-xs">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {selectedRecipe.totalTime}
                        </Badge>
                      )}
                      {selectedRecipe.yield && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 text-xs">
                          <Users className="w-3.5 h-3.5 mr-1.5" />
                          {selectedRecipe.yield}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedRecipe.sourceUrl && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md"
                        onClick={() => setShowOriginal(!showOriginal)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {showOriginal ? "Show Recipe" : "Original Site"}
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => setPlanningRecipe(selectedRecipe)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Plan
                    </Button>
                    <Button size="sm" className="shadow-xl" onClick={() => {
                      router.push(`/recipes/${selectedRecipe.id}/cook`)
                    }}>
                      <ChefHat className="w-4 h-4 mr-2" />
                      Start Cooking
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {showOriginal && selectedRecipe.sourceUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Original Recipe Page</h3>
                      <Button variant="outline" size="sm" onClick={() => window.open(selectedRecipe.sourceUrl, '_blank')}>
                        <Link className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                    <div className="w-full h-[60vh] rounded-xl overflow-hidden border bg-white shadow-inner">
                      <iframe 
                        src={selectedRecipe.sourceUrl} 
                        className="w-full h-full"
                        title="Original Recipe"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedRecipe.description && (
                      <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
                        {selectedRecipe.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Ingredients */}
                      <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-primary" />
                          Ingredients
                        </h3>
                        <ul className="space-y-2">
                          {selectedRecipe.ingredients?.map((ing: any, idx: number) => (
                            <li key={idx} className="text-sm border-b border-muted pb-2">
                              <span className="font-bold text-primary mr-1">
                                {ing.amount} {ing.unit}
                              </span>
                              <span className="text-foreground">{ing.item}</span>
                            </li>
                          )) || <li className="text-muted-foreground">No ingredients listed</li>}
                        </ul>
                      </div>

                      {/* Instructions Preview */}
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-primary" />
                          Instructions
                        </h3>
                        <ol className="space-y-4">
                          {selectedRecipe.instructions?.map((step: any, idx: number) => (
                            <li key={idx} className="flex gap-4 group">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-black">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-foreground leading-relaxed pt-1">{step.text}</span>
                            </li>
                          )) || <li className="text-muted-foreground">No instructions provided</li>}
                        </ol>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grocery List Dialog */}
      <Dialog open={showIngredientsList} onOpenChange={setShowIngredientsList}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShoppingBasket className="w-6 h-6 text-primary" />
              Weekly Grocery List
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <GroceryList />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowIngredientsList(false)} className="w-full h-12 text-lg">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanningDialog 
        recipe={planningRecipe} 
        open={planningRecipe !== null} 
        onOpenChange={(open: boolean) => !open && setPlanningRecipe(null)}
        onConfirm={(date: string, mealType: string) => handleAddToPlan(planningRecipe, date, mealType)}
      />

      <PlanningDialog 
        meal={editingMeal} 
        open={editingMeal !== null} 
        onOpenChange={(open: boolean) => !open && setEditingMeal(null)}
        onConfirm={(date: string, mealType: string) => handleUpdateMeal(editingMeal.id, date, mealType)}
      />
    </div>
  )
}

function PlanningDialog({ recipe, meal, open, onOpenChange, onConfirm }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mealType, setMealType] = useState('Dinner')

  // When meal is provided (editing), initialize with meal values
  useMemo(() => {
    if (meal) {
      setDate(meal.date.split('T')[0])
      setMealType(meal.mealType || 'Dinner')
    } else {
      setDate(new Date().toISOString().split('T')[0])
      setMealType('Dinner')
    }
  }, [meal, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meal ? 'Edit Meal Plan' : 'Add to Meal Plan'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={mealType} 
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm(date, mealType)}>{meal ? 'Save Changes' : 'Add to Plan'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GroceryList() {
  const { data, isLoading } = useApi<any>('/api/shopping-list')
  const [isUpdating, setIsUpdating] = useState(false)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Loading grocery list...</span>
      </div>
    )
  }

  const items = data?.items || []
  const needItems = items.filter((i: any) => i.status === 'need')
  const haveItems = items.filter((i: any) => i.status === 'have')

  const handleAction = async (id: string, action: string) => {
    setIsUpdating(true)
    try {
      await axios.post('/api/shopping-list', { id, action })
      mutate('/api/shopping-list')
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearHave = async () => {
    setIsUpdating(true)
    try {
      await axios.post('/api/shopping-list', { action: 'clear_have' })
      mutate('/api/shopping-list')
    } catch (error) {
      toast.error("Failed to clear items")
    } finally {
      setIsUpdating(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground italic">
        No items in your grocery list.
      </div>
    )
  }

  return (
    <div className="space-y-8 py-2">
      {/* Need to Buy Section */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">What I need to buy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {needItems.map((ing: any) => (
            <div 
              key={ing.id} 
              className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border group hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleAction(ing.id, 'toggle')}
            >
              <div className="h-6 w-6 rounded border-2 border-primary/20 flex items-center justify-center mt-0.5 group-hover:border-primary/50 transition-colors">
                <div className="w-4 h-4 text-primary opacity-0 group-hover:opacity-20" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg leading-tight">
                  {ing.amount} {ing.unit}
                </div>
                <div className="text-muted-foreground">{ing.item}</div>
                {ing.note && <div className="text-xs italic text-muted-foreground/60 mt-1">{ing.note}</div>}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(ing.id, 'delete')
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {needItems.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground italic bg-muted/10 rounded-xl border-2 border-dashed">
              Nothing left to buy!
            </div>
          )}
        </div>
      </section>

      {/* Already Have Section */}
      {haveItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What I already have</h3>
            <Button variant="ghost" size="sm" onClick={handleClearHave} className="text-xs h-8">Clear all</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {haveItems.map((ing: any) => (
              <div 
                key={ing.id} 
                className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20 group hover:border-primary/50 transition-colors cursor-pointer opacity-70"
                onClick={() => handleAction(ing.id, 'toggle')}
              >
                <div className="h-6 w-6 rounded border-2 border-primary bg-primary flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg leading-tight line-through opacity-50">
                    {ing.amount} {ing.unit}
                  </div>
                  <div className="text-muted-foreground line-through opacity-50">{ing.item}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(ing.id, 'delete')
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
