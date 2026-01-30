"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calculator, RotateCcw, ArrowLeft, Trophy, Share2, FileText, List, ChevronDown } from "lucide-react";
import type { PersonTotal } from "@/types";

interface ResultsStepProps {
  results: PersonTotal[];
  totalAmount: number;
  namesCount: number;
  onBack: () => void;
  onReset: () => void;
}

export function ResultsStep({
  results,
  totalAmount,
  namesCount,
  onBack,
  onReset,
}: ResultsStepProps) {
  const generateSimpleBill = () => {
    return `\nTotal: $${totalAmount.toFixed(2)}\n\n${results
      .map((person) => `${person.name}: $${person.total.toFixed(2)}`)
      .join("\n")}\n\nSplit with Posa Xrosto!`;
  };

  const generateFullBill = () => {
    const personDetails = results
      .map((person) => {
        const itemsList = person.items
          .map((item) => `  • ${item.name}: $${item.share.toFixed(2)}`)
          .join("\n");
        return `${person.name}: $${person.total.toFixed(2)}\n${itemsList}`;
      })
      .join("\n\n");

    return `\nTotal: $${totalAmount.toFixed(2)}\n\n${personDetails}\n\nSplit with Posa Xrosto!`;
  };

  const handleShare = async (type: "simple" | "full") => {
    const shareText = type === "simple" ? generateSimpleBill() : generateFullBill();
    const title = type === "simple" ? "Simple Bill Split Result:" : "Full Bill Split Result:";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-vanilla-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border-2 border-glaucous-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-glaucous-500 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-eerie-800 flex items-center justify-center gap-2">
              <Calculator className="w-6 h-6" />
              Bill Split Results
            </CardTitle>
            <CardDescription className="text-lg text-eerie-600">
              Here&apos;s how much each person owes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8 p-6 bg-vanilla-100 rounded-2xl border-2 border-vanilla-200">
              <div className="text-4xl font-bold text-eerie-900 mb-2">
                Total: ${totalAmount.toFixed(2)}
              </div>
              <div className="text-eerie-700">
                Split among {namesCount} people
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {results.map((person) => (
                <Card
                  key={person.name}
                  className="border-l-4 border-l-amaranth-500 bg-white border-2 border-amaranth-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-eerie-800">
                        {person.name}
                      </h3>
                      <div className="text-3xl font-bold text-amaranth-600">
                        ${person.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {person.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-eerie-700">{item.name}</span>
                          <span className="font-semibold text-glaucous-600">
                            ${item.share.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 border-2 border-eerie-200 text-eerie-700 bg-white hover:bg-eerie-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Items
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => handleShare("full")}
                    className="cursor-pointer"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Full Bill
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleShare("simple")}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Simple Bill
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={onReset}
                className="flex-1 bg-amaranth-500 hover:bg-amaranth-600 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
