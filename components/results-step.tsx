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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-300 shadow-xl">
          <CardHeader className="text-center space-y-5 pb-8">
            <div className="mx-auto w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
                <Calculator className="w-7 h-7" />
                Bill Split Results
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Here&apos;s how much each person owes
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8 p-6 bg-gray-900 text-white border border-gray-800 shadow-md">
              <div className="text-4xl font-bold mb-2">
                Total: ${totalAmount.toFixed(2)}
              </div>
              <div className="text-base text-gray-200">
                Split among {namesCount} people
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {results.map((person) => (
                <Card
                  key={person.name}
                  className="border-l-4 border-l-gray-800 bg-white border border-gray-300 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900">
                        {person.name}
                      </h3>
                      <div className="text-3xl font-bold text-gray-900">
                        ${person.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {person.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex justify-between text-sm p-3 bg-gray-50 border border-gray-200"
                        >
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <span className="font-semibold text-gray-900">
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
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Items
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-md">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-white border border-gray-300">
                  <DropdownMenuItem 
                    onClick={() => handleShare("full")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Full Bill
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleShare("simple")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Simple Bill
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={onReset}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm"
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
