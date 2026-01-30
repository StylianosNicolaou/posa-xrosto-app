"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Utensils } from "lucide-react"

interface ItemFormProps {
  currentItem: { name: string; price: string }
  setCurrentItem: (item: { name: string; price: string }) => void
  names: string[]
  selectedParticipants: string[]
  toggleParticipant: (name: string) => void
  isValid: boolean
  onAddItem: () => void
}

export function ItemForm({
  currentItem,
  setCurrentItem,
  names,
  selectedParticipants,
  toggleParticipant,
  isValid,
  onAddItem,
}: ItemFormProps) {
  return (
    <Card className="bg-white border border-gray-300 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">Step 3: Add Items</span>
        </CardTitle>
        <CardDescription className="text-gray-600">Add dishes and select who shared each item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-gray-700 font-semibold text-sm">
              Item Name
            </Label>
            <Input
              id="itemName"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              placeholder="e.g., Caesar Salad"
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemPrice" className="text-gray-700 font-semibold text-sm">
              Price ($)
            </Label>
            <Input
              id="itemPrice"
              type="number"
              step="0.01"
              min="0"
              value={currentItem.price}
              onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
              placeholder="0.00"
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-700 font-semibold text-sm">Who shared this item?</Label>
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200">
            {names.map((name) => (
              <div
                key={name}
                className="flex items-center space-x-2 p-3 bg-white hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Checkbox
                  id={`participant-${name}`}
                  checked={selectedParticipants.includes(name)}
                  onCheckedChange={() => toggleParticipant(name)}
                  className="border-gray-400 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800"
                />
                <Label htmlFor={`participant-${name}`} className="text-sm text-gray-700 font-medium cursor-pointer">
                  {name}
                </Label>
              </div>
            ))}
          </div>
          {selectedParticipants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Selected participants:</p>
              <div className="flex flex-wrap gap-2">
                {selectedParticipants.map((name) => (
                  <Badge key={name} className="bg-gray-800 text-white hover:bg-gray-700 px-3 py-1 font-medium">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={onAddItem}
          disabled={!isValid}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-50 disabled:bg-gray-300 shadow-md font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  )
}
