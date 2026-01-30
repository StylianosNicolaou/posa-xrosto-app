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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-300 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Step 1: Number of People</CardTitle>
          <CardDescription className="text-gray-600">How many people are dining together?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-gray-700 font-semibold text-sm">
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
                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            {/* Custom input */}
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="text-sm text-gray-600">
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
                className="text-xl text-center h-14 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            
            {numberOfPeople && !isValid && (
              <div className="p-3 bg-gray-100 text-gray-800 border border-gray-300">
                <p className="text-sm text-center font-medium">Please enter a number between 2 and 20</p>
              </div>
            )}
          </div>

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
              onClick={() => {
                if (isValid) {
                  onNext()
                }
              }}
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
