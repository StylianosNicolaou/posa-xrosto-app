"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FOOD_ICONS = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Pizza.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hamburger.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/French%20Fries.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Sushi.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Doughnut.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Taco.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Sandwich.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Popcorn.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hot%20Dog.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Soft%20Ice%20Cream.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Bagel.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Pancakes.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Croissant.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Burrito.png",
];

interface FloatingFood {
  id: number;
  icon: string;
  x: number;
  duration: number;
  delay: number;
  scale: number;
  rotation: number;
  swayAmount: number;
}

export function FoodBackground() {
  const [foods, setFoods] = useState<FloatingFood[]>([]);

  useEffect(() => {
    // Generate random food items
    const items: FloatingFood[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      icon: FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)],
      x: Math.random() * 85 + 5, // Random horizontal position (5% to 90%)
      duration: 15 + Math.random() * 20, // Fall duration 15-35s
      delay: Math.random() * 15, // Staggered start
      scale: 0.4 + Math.random() * 0.6, // Random sizes from 0.4x to 1x
      rotation: Math.random() * 360,
      swayAmount: 3 + Math.random() * 5, // Horizontal sway during fall
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

      {/* Floating Food Elements - Fall from top to bottom */}
      {foods.map((food) => (
        <motion.div
          key={food.id}
          initial={{
            x: `${food.x}vw`,
            y: "-15vh", // Start above screen
            opacity: 0,
            rotate: food.rotation,
            scale: food.scale,
          }}
          animate={{
            y: "115vh", // Fall past bottom of screen
            x: [
              `${food.x}vw`,
              `${food.x + food.swayAmount}vw`,
              `${food.x - food.swayAmount}vw`,
              `${food.x}vw`,
            ],
            rotate: [food.rotation, food.rotation + 180, food.rotation + 360],
            opacity: [0, 0.7, 0.7, 0.7, 0], // Fade in at top, fade out at bottom
          }}
          transition={{
            duration: food.duration,
            repeat: Infinity,
            delay: food.delay,
            ease: "linear",
            x: {
              duration: food.duration,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            width: `${food.scale * 100}px`,
            height: `${food.scale * 100}px`,
            left: 0,
            top: 0,
          }}
        >
          <img
            src={food.icon}
            alt=""
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}
