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
    <Card className="bg-white border border-gray-300 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-lg font-bold">Items Added ({items.length})</span>
          </div>
          <Badge className="text-base px-3 py-1.5 bg-gray-900 text-white">
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
                className={`p-4 border hover:shadow-lg transition-all duration-200 ${
                  hasParticipants 
                    ? "border-gray-300 bg-white" 
                    : "border-gray-400 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      <span className="font-bold text-xl text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Participant Selection */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 font-medium">
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
                              className={`cursor-pointer transition-all duration-200 select-none border font-medium ${
                                isSelected
                                  ? "bg-gray-800 text-white border-gray-800 hover:bg-gray-700"
                                  : "bg-white text-gray-700 border-gray-400 hover:border-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {hasParticipants ? (
                      <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 inline-block border border-gray-200 font-medium">
                        ${(item.price / item.participants.length).toFixed(2)} per person
                      </p>
                    ) : (
                      <p className="text-sm text-white bg-gray-800 px-3 py-2 inline-flex items-center gap-2 border border-gray-800 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        No one assigned yet
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-6 bg-gray-200" />
        
        {hasUnassignedItems && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-300 flex items-center gap-2 text-gray-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Some items have no one assigned. They won&apos;t be included in the split.
            </p>
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
            onClick={onCalculate}
            disabled={items.length === 0}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-50 disabled:bg-gray-300 shadow-md font-semibold"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate Split
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
