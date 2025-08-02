"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Utensils, Download } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall()

  return (
    <div className="min-h-screen bg-vanilla-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-2 border-amaranth-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-amaranth-500 rounded-full flex items-center justify-center">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-eerie-800">Posa Xrosto?</CardTitle>
          <CardDescription className="text-lg text-eerie-600">
            Easily calculate who owes what when sharing plates at a restaurant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <Users className="w-4 h-4 text-cyan-600" />
              <span className="text-eerie-700">Add diners</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-vanilla-50 rounded-lg border border-vanilla-300">
              <Utensils className="w-4 h-4 text-vanilla-700" />
              <span className="text-eerie-700">Enter dishes</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onStart}
              className="w-full bg-glaucous-500 hover:bg-glaucous-600 text-white font-semibold py-6 text-lg"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Start Splitting
            </Button>

            {isInstallable && !isInstalled && (
              <Button
                onClick={installApp}
                variant="outline"
                className="w-full border-2 border-amaranth-300 text-amaranth-700 hover:bg-amaranth-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
          </div>

          <div className="text-center text-xs text-eerie-500">Works offline • Mobile optimized</div>
        </CardContent>
      </Card>
    </div>
  )
}
