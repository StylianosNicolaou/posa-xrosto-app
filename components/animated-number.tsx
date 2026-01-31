"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { formatCurrency, type Currency, DEFAULT_CURRENCY } from "@/lib/currency";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  currency?: Currency;
  decimals?: number;
  delay?: number;
}

export function AnimatedNumber({
  value,
  className = "",
  currency = DEFAULT_CURRENCY,
  decimals = 2,
  delay = 400,
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    stiffness: 80,
    damping: 20,
  });

  // Start at 0 so the count-up is visible
  const [displayValue, setDisplayValue] = useState(formatCurrency(0, currency));

  useEffect(() => {
    // Delay the animation start so it happens after screen transition
    const timeout = setTimeout(() => {
      spring.set(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [spring, value, delay]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplayValue(formatCurrency(latest, currency));
    });
  }, [spring, currency]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
