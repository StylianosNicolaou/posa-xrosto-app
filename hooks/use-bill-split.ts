"use client";

import { useState } from "react";
import type { Item, PersonTotal } from "@/types";

export function useBillSplit() {
  const [step, setStep] = useState(0);
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [currentNames, setCurrentNames] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState({ name: "", price: "" });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [results, setResults] = useState<PersonTotal[]>([]);

  // Validation functions
  const isValidNumberOfPeople = () => {
    const num = Number.parseInt(numberOfPeople);
    return num > 1 && num <= 20;
  };

  const isValidNames = () => {
    const validNames = currentNames.filter((name) => name.trim() !== "");
    const uniqueNames = new Set(
      validNames.map((name) => name.trim().toLowerCase())
    );
    return (
      validNames.length === Number.parseInt(numberOfPeople) &&
      uniqueNames.size === validNames.length
    );
  };

  const isValidItem = () => {
    return (
      currentItem.name.trim() !== "" &&
      Number.parseFloat(currentItem.price) > 0 &&
      selectedParticipants.length > 0
    );
  };

  // Step handlers
  const handleNumberSubmit = () => {
    if (isValidNumberOfPeople()) {
      setCurrentNames(new Array(Number.parseInt(numberOfPeople)).fill(""));
      setStep(2); // Changed from setStep(1) to setStep(2)
    }
  };

  const handleNamesSubmit = () => {
    if (isValidNames()) {
      setNames(currentNames.map((name) => name.trim()));
      setStep(3); // Changed from setStep(2) to setStep(3)
    }
  };

  const handleAddItem = () => {
    if (isValidItem()) {
      const newItem: Item = {
        id: Date.now().toString(),
        name: currentItem.name.trim(),
        price: Number.parseFloat(currentItem.price),
        participants: [...selectedParticipants],
      };
      setItems([...items, newItem]);
      setCurrentItem({ name: "", price: "" });
      setSelectedParticipants([]);
    }
  };

  const handleAddMultipleItems = (
    scannedItems: { name: string; price: number }[]
  ) => {
    const newItems: Item[] = scannedItems.map((scannedItem) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: scannedItem.name,
      price: scannedItem.price,
      participants: [], // No participants by default - user must select
    }));
    setItems([...items, ...newItems]);
  };

  const handleToggleItemParticipant = (itemId: string, participantName: string) => {
    setItems(items.map((item) => {
      if (item.id !== itemId) return item;
      const hasParticipant = item.participants.includes(participantName);
      return {
        ...item,
        participants: hasParticipant
          ? item.participants.filter((p) => p !== participantName)
          : [...item.participants, participantName],
      };
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCalculate = () => {
    const personTotals: PersonTotal[] = names.map((name) => ({
      name,
      total: 0,
      items: [],
    }));

    items.forEach((item) => {
      // Skip items with no participants assigned
      if (item.participants.length === 0) return;
      
      const sharePerPerson = item.price / item.participants.length;
      item.participants.forEach((participant) => {
        const person = personTotals.find((p) => p.name === participant);
        if (person) {
          person.total += sharePerPerson;
          person.items.push({
            name: item.name,
            share: sharePerPerson,
          });
        }
      });
    });

    setResults(personTotals);
    setStep(4); // Changed from setStep(3) to setStep(4)
  };

  const handleReset = () => {
    setStep(0);
    setNumberOfPeople("");
    setNames([]);
    setCurrentNames([]);
    setItems([]);
    setCurrentItem({ name: "", price: "" });
    setSelectedParticipants([]);
    setResults([]);
  };

  const toggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return {
    // State
    step,
    numberOfPeople,
    names,
    currentNames,
    items,
    currentItem,
    selectedParticipants,
    results,
    totalAmount,
    // Setters
    setStep,
    setNumberOfPeople,
    setCurrentNames,
    setCurrentItem,
    // Validation
    isValidNumberOfPeople,
    isValidNames,
    isValidItem,
    // Handlers
    handleNumberSubmit,
    handleNamesSubmit,
    handleAddItem,
    handleAddMultipleItems,
    handleRemoveItem,
    handleToggleItemParticipant,
    handleCalculate,
    handleReset,
    toggleParticipant,
  };
}
