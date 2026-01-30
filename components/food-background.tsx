"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FOOD_ICONS = [
  "🍕",
  "🍔",
  "🍟",
  "🍣",
  "🌮",
  "🍩",
  "🥑",
  "🥓",
  "🥩",
  "🍤",
  "🍪",
  "🍫",
];

interface FloatingFood {
  id: number;
  icon: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  scale: number;
  rotation: number;
}

export function FoodBackground() {
  const [foods, setFoods] = useState<FloatingFood[]>([]);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    // Generate random food items
    const items: FloatingFood[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      icon: FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 10,
      scale: 0.8 + Math.random() * 1.5,
      rotation: Math.random() * 360,
    }));
    setFoods(items);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#fcfcfc]">
      {/* Dynamic Gradient Orbs - Monochrome/Grayscale */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-gray-200/40 rounded-full blur-[100px] animate-pulse-slow" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-zinc-200/40 rounded-full blur-[120px] animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />
      <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-slate-200/30 rounded-full blur-[80px]" />

      {/* Floating Food Elements - Grayscale */}
      {foods.map((food, i) => (
        <motion.div
          key={food.id}
          initial={{
            x: `${food.x}vw`,
            y: `${food.y}vh`,
            opacity: 0,
            rotate: food.rotation,
            scale: 0,
          }}
          animate={{
            y: [
              `${food.y}vh`,
              `${food.y + (i % 2 === 0 ? 10 : -10)}vh`,
              `${food.y}vh`,
            ],
            x: [
              `${food.x}vw`,
              `${food.x + (i % 2 === 0 ? 5 : -5)}vw`,
              `${food.x}vw`,
            ],
            rotate: [food.rotation, food.rotation + 45, food.rotation],
            opacity: [0, 0.1, 0], // Lower opacity for subtle look
            scale: [0, food.scale, 0],
          }}
          transition={{
            duration: food.duration,
            repeat: Infinity,
            delay: food.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            fontSize: `${food.scale * 3}rem`,
            filter: "blur(1px) grayscale(100%)", // Force grayscale
            y: i % 2 === 0 ? y1 : y2,
          }}
          className="text-black/10 mix-blend-multiply"
        >
          {food.icon}
        </motion.div>
      ))}
    </div>
  );
}
