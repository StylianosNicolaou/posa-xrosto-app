"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, ArrowLeft, ArrowRight } from "lucide-react"

interface NumberOfPeopleStepProps {
  numberOfPeople: string
  setNumberOfPeople: (value: string) => void
  isValid: boolean
  onNext: () => void
  onBack: () => void
}

export function NumberOfPeopleStep({
  numberOfPeople,
  setNumberOfPeople,
  isValid,
  onNext,
  onBack,
}: NumberOfPeopleStepProps) {
  return (
    <div className="min-h-screen bg-glaucous-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-2 border-glaucous-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-16 h-16 bg-glaucous-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-eerie-800">Step 1: Number of People</CardTitle>
          <CardDescription className="text-eerie-600">How many people are dining together?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-eerie-700 font-medium">
              Select number of people
            </Label>
            
            {/* Preset buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  onClick={() => setNumberOfPeople(num.toString())}
                  className={`h-14 text-xl font-semibold transition-all duration-200 ${
                    numberOfPeople === num.toString()
                      ? "bg-glaucous-500 text-white border-glaucous-500 hover:bg-glaucous-600"
                      : "bg-white text-eerie-700 border-2 border-glaucous-200 hover:border-glaucous-400 hover:bg-glaucous-50"
                  }`}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            {/* Custom input */}
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="text-sm text-eerie-600">
                Or enter a custom number (2-20)
              </Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="2"
                max="20"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                placeholder="Enter number"
                className="text-xl text-center h-14 border-2 border-glaucous-200 focus:border-glaucous-400"
              />
            </div>
            
            {numberOfPeople && !isValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 text-center">Please enter a number between 2 and 20</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-2 border-eerie-200 text-eerie-700 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => {
                if (isValid) {
                  onNext()
                }
              }}
              disabled={!isValid}
              className="flex-1 bg-glaucous-500 hover:bg-glaucous-600 text-white disabled:opacity-50"
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
