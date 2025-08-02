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
} from "lucide-react";
import type { Item } from "@/types";

interface ItemsListProps {
  items: Item[];
  totalAmount: number;
  onRemoveItem: (id: string) => void;
  onCalculate: () => void;
  onBack: () => void;
}

export function ItemsList({
  items,
  totalAmount,
  onRemoveItem,
  onCalculate,
  onBack,
}: ItemsListProps) {
  if (items.length === 0) return null;

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
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border-2 border-cyan-100 rounded-xl bg-cyan-50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-eerie-800">
                      {item.name}
                    </h4>
                    <span className="font-bold text-xl text-glaucous-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.participants.map((participant) => (
                      <Badge
                        key={participant}
                        variant="outline"
                        className="text-xs border-amaranth-300 text-amaranth-700 bg-amaranth-50"
                      >
                        {participant}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-eerie-600 bg-white px-2 py-1 rounded-md inline-block">
                    ${(item.price / item.participants.length).toFixed(2)} per
                    person
                  </p>
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
          ))}
        </div>
        <Separator className="my-6" />
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
