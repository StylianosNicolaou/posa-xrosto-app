"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, UserPlus, Shuffle } from "lucide-react"

const COLORS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Teal",
  "Golden", "Silver", "Crimson", "Azure", "Emerald", "Coral", "Violet",
  "Indigo", "Scarlet", "Jade", "Amber", "Ivory"
]

const ANIMALS = [
  "Panda", "Tiger", "Eagle", "Wolf", "Fox", "Bear", "Lion", "Hawk",
  "Dolphin", "Owl", "Falcon", "Panther", "Phoenix", "Dragon", "Lynx",
  "Cobra", "Raven", "Jaguar", "Shark", "Koala"
]

interface NamesEntryStepProps {
  currentNames: string[]
  setCurrentNames: (names: string[]) => void
  isValid: boolean
  onNext: () => void
  onBack: () => void
}

export function NamesEntryStep({ currentNames, setCurrentNames, isValid, onNext, onBack }: NamesEntryStepProps) {
  const updateName = (index: number, value: string) => {
    const newNames = [...currentNames]
    newNames[index] = value
    setCurrentNames(newNames)
  }

  const assignRandomNames = () => {
    const count = currentNames.length
    const usedCombos = new Set<string>()
    const randomNames: string[] = []

    while (randomNames.length < count) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
      const combo = `${color} ${animal}`
      
      if (!usedCombos.has(combo)) {
        usedCombos.add(combo)
        randomNames.push(combo)
      }
    }

    setCurrentNames(randomNames)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-300 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Step 2: Enter Names</CardTitle>
          <CardDescription className="text-gray-600">Enter the name of each person dining</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Random names button */}
          <Button
            type="button"
            variant="outline"
            onClick={assignRandomNames}
            className="w-full border-2 border-dashed border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Assign Random Names
          </Button>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {currentNames.map((name, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`name-${index}`} className="text-gray-700 font-semibold text-sm">
                  Person {index + 1}
                </Label>
                <Input
                  id={`name-${index}`}
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  placeholder={`Enter name for person ${index + 1}`}
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            ))}
          </div>

          {!isValid && currentNames.some((name) => name.trim() !== "") && (
            <div className="p-3 bg-gray-100 text-gray-800 border border-gray-300">
              <p className="text-sm text-center font-medium">Please fill all names with unique values</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:bg-gray-300 shadow-md"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
