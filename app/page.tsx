"use client";

import { useBillSplit } from "@/hooks/use-bill-split";
import { WelcomeScreen } from "@/components/welcome-screen";
import { NumberOfPeopleStep } from "@/components/number-of-people-step";
import { NamesEntryStep } from "@/components/names-entry-step";
import { ItemsManagementStep } from "@/components/items-management-step";
import { ResultsStep } from "@/components/results-step";

export default function PosaXrosto() {
  const {
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
    handleCalculate,
    handleReset,
    toggleParticipant,
  } = useBillSplit();

  // Welcome Screen
  if (step === 0) {
    return <WelcomeScreen onStart={() => setStep(1)} />;
  }

  // Step 1: Number of People
  if (step === 1) {
    return (
      <NumberOfPeopleStep
        numberOfPeople={numberOfPeople}
        setNumberOfPeople={setNumberOfPeople}
        isValid={isValidNumberOfPeople()}
        onNext={handleNumberSubmit}
        onBack={() => setStep(0)}
      />
    );
  }

  // Step 2: Enter Names
  if (step === 2) {
    return (
      <NamesEntryStep
        currentNames={currentNames}
        setCurrentNames={setCurrentNames}
        isValid={isValidNames()}
        onNext={handleNamesSubmit}
        onBack={() => setStep(1)}
      />
    );
  }

  // Step 3: Add Items
  if (step === 3) {
    return (
      <ItemsManagementStep
        names={names}
        items={items}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        selectedParticipants={selectedParticipants}
        toggleParticipant={toggleParticipant}
        totalAmount={totalAmount}
        isValidItem={isValidItem()}
        onAddItem={handleAddItem}
        onAddMultipleItems={handleAddMultipleItems}
        onRemoveItem={handleRemoveItem}
        onCalculate={handleCalculate}
        onBack={() => setStep(2)}
      />
    );
  }

  // Step 4: Results
  if (step === 4) {
    return (
      <ResultsStep
        results={results}
        totalAmount={totalAmount}
        namesCount={names.length}
        onBack={() => setStep(3)}
        onReset={handleReset}
      />
    );
  }

  return null;
}
