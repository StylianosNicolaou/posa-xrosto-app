"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-amaranth-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-2 border-amaranth-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-16 h-16 bg-amaranth-500 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-eerie-800">Step 2: Enter Names</CardTitle>
          <CardDescription className="text-eerie-600">Enter the name of each person dining</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {currentNames.map((name, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`name-${index}`} className="text-eerie-700 font-medium">
                  Person {index + 1}
                </Label>
                <Input
                  id={`name-${index}`}
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  placeholder={`Enter name for person ${index + 1}`}
                  className="border-2 border-amaranth-200 focus:border-amaranth-400"
                />
              </div>
            ))}
          </div>

          {!isValid && currentNames.some((name) => name.trim() !== "") && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">Please fill all names with unique values</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-2 border-eerie-200 text-eerie-700 bg-white hover:bg-eerie-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
              className="flex-1 bg-amaranth-500 hover:bg-amaranth-600 text-white disabled:opacity-50 disabled:bg-gray-300"
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
