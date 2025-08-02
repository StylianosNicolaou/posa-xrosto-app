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
    <Card className="bg-white border-2 border-cyan-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-eerie-800">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          Step 3: Add Items
        </CardTitle>
        <CardDescription className="text-eerie-600">Add dishes and select who shared each item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-eerie-700 font-medium">
              Item Name
            </Label>
            <Input
              id="itemName"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              placeholder="e.g., Caesar Salad"
              className="border-2 border-cyan-200 focus:border-cyan-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemPrice" className="text-eerie-700 font-medium">
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
              className="border-2 border-vanilla-200 focus:border-vanilla-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-eerie-700 font-medium">Who shared this item?</Label>
          <div className="grid grid-cols-2 gap-3 p-4 bg-glaucous-50 rounded-xl border-2 border-glaucous-200">
            {names.map((name) => (
              <div
                key={name}
                className="flex items-center space-x-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`participant-${name}`}
                  checked={selectedParticipants.includes(name)}
                  onCheckedChange={() => toggleParticipant(name)}
                  className="border-2 border-glaucous-300 data-[state=checked]:bg-glaucous-500"
                />
                <Label htmlFor={`participant-${name}`} className="text-sm text-eerie-700 cursor-pointer">
                  {name}
                </Label>
              </div>
            ))}
          </div>
          {selectedParticipants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-eerie-600 font-medium">Selected participants:</p>
              <div className="flex flex-wrap gap-2">
                {selectedParticipants.map((name) => (
                  <Badge key={name} className="bg-amaranth-500 text-white hover:bg-amaranth-600">
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
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 text-lg disabled:opacity-50 disabled:bg-gray-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  )
}
