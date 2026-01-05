"use client"

import { useParams, useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronLeft, ChevronRight, Utensils, Check, ChefHat } from "lucide-react"
import { useState, useMemo } from "react"

export default function CookModePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [currentStep, setCurrentStep] = useState(0)

  const { data: recipe, isLoading } = useApi<any>(id ? `/api/recipes?id=${id}` : null)

  const stepIngredients = useMemo(() => {
    if (!recipe) return []
    return recipe.ingredients.filter((ing: any) => 
      ing.stepIndices?.includes(currentStep)
    )
  }, [recipe, currentStep])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <h1 className="text-2xl font-bold">Recipe not found</h1>
        <Button onClick={() => router.push('/recipes')}>Back to Recipes</Button>
      </div>
    )
  }

  const instructions = recipe.instructions || []

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Exit Cook Mode
          </Button>
          <h2 className="text-xl font-bold truncate max-w-[400px] md:max-w-xl">{recipe.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-1">
            {instructions.map((_: any, i: number) => (
              <div 
                key={i} 
                className={`h-1.5 w-6 rounded-full transition-colors ${i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} 
              />
            ))}
          </div>
          <Badge variant="outline" className="font-mono text-lg py-1 px-3">
            Step {currentStep + 1} / {instructions.length}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Instruction Area */}
        <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center text-center overflow-y-auto">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-5xl font-black mb-4">
              {currentStep + 1}
            </div>
            <p className="text-4xl md:text-6xl font-medium leading-tight text-foreground">
              {instructions[currentStep]?.text}
            </p>
          </div>
        </div>

        {/* Sidebar Ingredients for this step */}
        {stepIngredients.length > 0 && (
          <div className="w-full md:w-96 bg-muted/20 border-l p-8 overflow-y-auto">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-primary">
              <Utensils className="w-6 h-6" />
              Needed Now
            </h3>
            <ul className="space-y-6">
              {stepIngredients.map((ing: any, idx: number) => (
                <li key={idx} className="flex gap-4 bg-card p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-2xl mb-1">
                      {ing.amount} {ing.unit}
                    </div>
                    <div className="text-xl text-muted-foreground">{ing.item}</div>
                    {ing.note && <div className="text-sm italic text-muted-foreground/70 mt-2">{ing.note}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="p-8 md:p-12 grid grid-cols-2 gap-8 bg-muted/30 border-t">
        <Button 
          size="lg" 
          variant="outline" 
          className="h-28 text-3xl rounded-3xl border-2"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
        >
          <ChevronLeft className="w-10 h-10 mr-4" />
          Previous
        </Button>
        <Button 
          size="lg" 
          className="h-28 text-3xl rounded-3xl shadow-2xl"
          onClick={() => {
            if (currentStep === instructions.length - 1) {
              router.push('/recipes')
            } else {
              setCurrentStep(s => s + 1)
            }
          }}
        >
          {currentStep === instructions.length - 1 ? (
            <>Finish <Check className="w-10 h-10 ml-4" /></>
          ) : (
            <>Next <ChevronRight className="w-10 h-10 ml-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}

