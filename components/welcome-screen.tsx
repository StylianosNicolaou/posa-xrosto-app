"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Download, Calculator } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-300 shadow-xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Posa Xrosto?</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Split bills effortlessly when dining together
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onStart}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-6 text-lg shadow-md"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Start Splitting
          </Button>

          {isInstallable && !isInstalled && (
            <Button
              onClick={installApp}
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}

          <div className="text-center text-xs text-gray-500 font-medium pt-2">
            Works offline • Mobile optimized
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
