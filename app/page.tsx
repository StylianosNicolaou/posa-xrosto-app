"use client";

import { useBillSplit } from "@/hooks/use-bill-split";
import { WelcomeScreen } from "@/components/welcome-screen";
import { NumberOfPeopleStep } from "@/components/number-of-people-step";
import { NamesEntryStep } from "@/components/names-entry-step";
import { ItemsManagementStep } from "@/components/items-management-step";
import { ResultsStep } from "@/components/results-step";
import { InstallPrompt } from "@/components/install-prompt";

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
    currency,
    // Setters
    setStep,
    setNumberOfPeople,
    setCurrentNames,
    setCurrentItem,
    setCurrency,
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
    handleEditItem,
    handleToggleItemParticipant,
    handleCalculate,
    handleReset,
    toggleParticipant,
  } = useBillSplit();

  const renderStep = () => {
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
          onEditItem={handleEditItem}
          onToggleItemParticipant={handleToggleItemParticipant}
          onCalculate={handleCalculate}
          onBack={() => setStep(2)}
          currency={currency}
          onCurrencyChange={setCurrency}
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
          currency={currency}
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderStep()}
      <InstallPrompt />
    </>
  );
}
