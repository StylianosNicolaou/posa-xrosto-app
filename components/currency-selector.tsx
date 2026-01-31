"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  const currentCurrency = CURRENCIES[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium"
        >
          <span className="text-lg mr-1">{currentCurrency.symbol}</span>
          {currentCurrency.code}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-white border-neutral-200">
        {Object.values(CURRENCIES).map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => onCurrencyChange(curr.code)}
            className={`cursor-pointer py-2.5 px-2 rounded-lg text-neutral-700 focus:bg-neutral-100 focus:text-neutral-900 ${
              curr.code === currency ? "bg-brand-primary/10 text-brand-primary font-semibold" : ""
            }`}
          >
            <span className="text-lg mr-2 min-w-[24px]">{curr.symbol}</span>
            <span className="flex-1">{curr.name}</span>
            <span className="text-xs text-neutral-400 ml-2">{curr.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
