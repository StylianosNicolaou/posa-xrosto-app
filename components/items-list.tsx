"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  DollarSign,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import type { Item } from "@/types";

interface ItemsListProps {
  items: Item[];
  names: string[];
  totalAmount: number;
  onRemoveItem: (id: string) => void;
  onToggleItemParticipant: (itemId: string, participantName: string) => void;
  onCalculate: () => void;
  onBack: () => void;
}

export function ItemsList({
  items,
  names,
  totalAmount,
  onRemoveItem,
  onToggleItemParticipant,
  onCalculate,
  onBack,
}: ItemsListProps) {
  if (items.length === 0) return null;
  
  const hasUnassignedItems = items.some((item) => item.participants.length === 0);

  return (
    <Card className="bg-white border-2 border-vanilla-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-vanilla-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-eerie-800">Items Added ({items.length})</span>
          </div>
          <Badge className="text-lg px-4 py-2 bg-amaranth-500 text-white">
            <DollarSign className="w-4 h-4 mr-1" />
            {totalAmount.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {items.map((item) => {
            const hasParticipants = item.participants.length > 0;
            return (
              <div
                key={item.id}
                className={`p-4 border-2 rounded-xl hover:shadow-md transition-all duration-200 ${
                  hasParticipants 
                    ? "border-cyan-100 bg-cyan-50" 
                    : "border-amber-300 bg-amber-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-eerie-800">
                        {item.name}
                      </h4>
                      <span className="font-bold text-xl text-glaucous-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Participant Selection */}
                    <div className="space-y-2">
                      <p className="text-xs text-eerie-500 font-medium">
                        Click names to assign:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {names.map((name) => {
                          const isSelected = item.participants.includes(name);
                          return (
                            <Badge
                              key={name}
                              variant="outline"
                              onClick={() => onToggleItemParticipant(item.id, name)}
                              className={`cursor-pointer transition-all duration-200 select-none ${
                                isSelected
                                  ? "bg-amaranth-500 text-white border-amaranth-500 hover:bg-amaranth-600"
                                  : "bg-white text-eerie-600 border-eerie-300 hover:border-amaranth-400 hover:text-amaranth-600"
                              }`}
                            >
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {hasParticipants ? (
                      <p className="text-sm text-eerie-600 bg-white px-2 py-1 rounded-md inline-block">
                        ${(item.price / item.participants.length).toFixed(2)} per person
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700 bg-amber-100 px-2 py-1 rounded-md inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        No one assigned yet
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-6" />
        
        {hasUnassignedItems && (
          <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">
              Some items have no one assigned. They won&apos;t be included in the split.
            </p>
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
            onClick={onCalculate}
            disabled={items.length === 0}
            className="flex-1 bg-glaucous-500 hover:bg-glaucous-600 text-white py-6 text-lg disabled:opacity-50 disabled:bg-gray-300"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate Split
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
