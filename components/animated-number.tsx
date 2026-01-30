"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
}

export function AnimatedNumber({
  value,
  className = "",
  prefix = "$",
  decimals = 2,
  delay = 400,
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    stiffness: 80,
    damping: 20,
  });

  // Start at $0.00 so the count-up is visible
  const [displayValue, setDisplayValue] = useState(`${prefix}${(0).toFixed(decimals)}`);

  useEffect(() => {
    // Delay the animation start so it happens after screen transition
    const timeout = setTimeout(() => {
      spring.set(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [spring, value, delay]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplayValue(`${prefix}${latest.toFixed(decimals)}`);
    });
  }, [spring, prefix, decimals]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
