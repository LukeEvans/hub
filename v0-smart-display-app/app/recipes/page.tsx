"use client"

import { Utensils, Clock, ChefHat, Search, Heart, Users, Flame } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

const recipes = [
  {
    id: 1,
    name: "Chicken Parmesan",
    image: "/chicken-parmesan-dish.jpg",
    time: 45,
    servings: 4,
    difficulty: "Medium",
    category: "Italian",
    calories: 520,
    favorite: true,
  },
  {
    id: 2,
    name: "Salmon with Asparagus",
    image: "/grilled-salmon-asparagus.jpg",
    time: 30,
    servings: 2,
    difficulty: "Easy",
    category: "Healthy",
    calories: 380,
    favorite: true,
  },
  {
    id: 3,
    name: "Chocolate Cake",
    image: "/chocolate-cake-slice.jpg",
    time: 60,
    servings: 8,
    difficulty: "Hard",
    category: "Dessert",
    calories: 450,
    favorite: false,
  },
  {
    id: 4,
    name: "Caesar Salad",
    image: "/caesar-salad-bowl.jpg",
    time: 15,
    servings: 4,
    difficulty: "Easy",
    category: "Salad",
    calories: 210,
    favorite: false,
  },
  {
    id: 5,
    name: "Beef Tacos",
    image: "/beef-tacos-platter.jpg",
    time: 35,
    servings: 6,
    difficulty: "Easy",
    category: "Mexican",
    calories: 380,
    favorite: true,
  },
  {
    id: 6,
    name: "Mushroom Risotto",
    image: "/creamy-mushroom-risotto.jpg",
    time: 50,
    servings: 4,
    difficulty: "Medium",
    category: "Italian",
    calories: 420,
    favorite: false,
  },
]

export default function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecipes = recipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const currentRecipe = selectedRecipe ? recipes.find((r) => r.id === selectedRecipe) : null

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
              <h1 className="text-4xl font-bold">Recipes</h1>
              <p className="text-muted-foreground text-lg">Mealie Recipe Manager</p>
            </div>
          </div>
          <Button className="rounded-full" size="lg">
            <ChefHat className="w-5 h-5 mr-2" />
            Cook Mode
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8 max-w-4xl">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{recipes.length}</div>
          <div className="text-sm text-muted-foreground">Total Recipes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{recipes.filter((r) => r.favorite).length}</div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">12</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">8</div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </Card>
      </div>

      {/* Recipes Grid */}
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">All Recipes</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="ghost" size="sm">
              Favorites
            </Button>
            <Button variant="ghost" size="sm">
              Quick
            </Button>
            <Button variant="ghost" size="sm">
              Healthy
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => setSelectedRecipe(recipe.id)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {recipe.favorite && (
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 backdrop-blur-sm text-foreground hover:bg-white">
                    {recipe.category}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-3">{recipe.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {recipe.calories} cal
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={selectedRecipe !== null} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {currentRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{currentRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <img
                  src={currentRecipe.image || "/placeholder.svg"}
                  alt={currentRecipe.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="flex gap-4">
                  <Badge variant="secondary" className="text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {currentRecipe.time} minutes
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {currentRecipe.servings} servings
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <ChefHat className="w-4 h-4 mr-1" />
                    {currentRecipe.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Flame className="w-4 h-4 mr-1" />
                    {currentRecipe.calories} cal
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>2 lbs chicken breast</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>1 cup marinara sauce</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>2 cups mozzarella cheese</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>1/2 cup parmesan cheese</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>1 cup breadcrumbs</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <span>Preheat oven to 375°F. Prepare chicken by pounding to even thickness.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <span>Coat chicken in breadcrumbs and bake for 20 minutes.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <span>Top with marinara sauce and cheeses, bake for 10 more minutes.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        4
                      </span>
                      <span>Let rest for 5 minutes before serving. Enjoy!</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" size="lg">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Start Cook Mode
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="w-5 h-5" />
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
