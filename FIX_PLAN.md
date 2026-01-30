# Posa Xrosto — Fix Plan

> Generated from production readiness audit.  
> Total issues: 47 unique items across 6 phases.  
> Estimated total effort: ~40-60 hours

---

## How to Use This Plan

1. **Work phase-by-phase.** Do not skip to Phase 3 before Phase 1 is complete.
2. **Each item has:**
   - `ID` — for tracking in issues/PRs
   - `Severity` — Critical/High/Medium/Low
   - `Effort` — S (< 1hr), M (1-4hr), L (4-8hr), XL (8hr+)
   - `Files` — exact files to modify
   - `Task` — what to do
   - `Acceptance Criteria` — how to know it's done
   - `Verification` — manual or automated check
3. **Mark items complete** by changing `[ ]` to `[x]`.

---

## Phase 0: Critical Security (BLOCK LAUNCH)

These issues can cause financial damage or service abuse. Fix before any public traffic.

---

### SEC-01: Add Rate Limiting to OCR Endpoint
- **Severity:** Critical
- **Effort:** S
- **Files:** `app/api/ocr/route.ts`, `package.json`
- **Task:**  
  Install `@upstash/ratelimit` and `@upstash/redis` (or use Vercel KV). Limit to 10 requests per IP per minute.
- **Implementation:**
  ```typescript
  // app/api/ocr/route.ts
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
  });

  export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    // ... rest of handler
  }
  ```
- **Acceptance Criteria:**
  - [ ] 10th request in 1 minute succeeds
  - [ ] 11th request in 1 minute returns 429
  - [ ] Response includes `Retry-After` header
- **Verification:**
  ```bash
  for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/ocr -H "Content-Type: application/json" -d '{"imageData":"test"}'; done
  # Last 2 should be 429
  ```

---

### SEC-02: Add Request Payload Size Limit
- **Severity:** Critical
- **Effort:** S
- **Files:** `app/api/ocr/route.ts`
- **Task:**  
  Check `Content-Length` header before parsing body. Reject payloads > 5MB.
- **Implementation:**
  ```typescript
  export async function POST(request: NextRequest) {
    const contentLength = request.headers.get("content-length");
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB." },
        { status: 413 }
      );
    }
    // ... rest of handler
  }
  ```
- **Acceptance Criteria:**
  - [ ] 4MB payload succeeds
  - [ ] 6MB payload returns 413 with clear error message
- **Verification:**
  ```bash
  # Create 6MB file
  dd if=/dev/zero bs=1M count=6 | base64 > /tmp/large.txt
  curl -X POST http://localhost:3000/api/ocr -H "Content-Type: application/json" -d "{\"imageData\":\"$(cat /tmp/large.txt)\"}"
  # Should return 413
  ```

---

### SEC-03: Add Request Timeout with AbortController
- **Severity:** High
- **Effort:** S
- **Files:** `app/api/ocr/route.ts`
- **Task:**  
  Wrap OpenAI call with AbortController. Abort after 30 seconds.
- **Implementation:**
  ```typescript
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        // ... rest of params
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    throw error;
  }
  ```
- **Acceptance Criteria:**
  - [ ] Slow response (> 30s) returns 504 with timeout message
  - [ ] Normal response (< 30s) succeeds
- **Verification:**  
  Mock slow OpenAI response in test, verify 504 returned.

---

### SEC-04: Remove Sensitive Data from Logs
- **Severity:** High
- **Effort:** S
- **Files:** `app/api/ocr/route.ts`
- **Task:**  
  Replace `console.log("GPT-4o Response:", content)` with non-PII log.
- **Implementation:**
  ```typescript
  // Before
  console.log("GPT-4o Response:", content);

  // After
  console.log("GPT-4o Response received", {
    itemCount: parsedData.items?.length ?? 0,
    hasRestaurant: !!parsedData.restaurant,
    hasDate: !!parsedData.date,
  });
  ```
- **Acceptance Criteria:**
  - [ ] No item names, prices, or image data in logs
  - [ ] Log includes item count for debugging
- **Verification:**  
  Run OCR request, check server logs for PII.

---

### SEC-05: Add Input Schema Validation with Zod
- **Severity:** High
- **Effort:** M
- **Files:** `app/api/ocr/route.ts`, `package.json`
- **Task:**  
  Install Zod. Validate request body structure before processing.
- **Implementation:**
  ```typescript
  import { z } from "zod";

  const RequestSchema = z.object({
    imageData: z.string()
      .min(100, "Image data too short")
      .max(10 * 1024 * 1024, "Image data too large")
      .refine(
        (val) => val.startsWith("data:image/") || /^[A-Za-z0-9+/=]+$/.test(val),
        "Invalid image format"
      ),
  });

  export async function POST(request: NextRequest) {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { imageData } = parsed.data;
    // ... rest of handler
  }
  ```
- **Acceptance Criteria:**
  - [ ] Missing `imageData` returns 400
  - [ ] Non-string `imageData` returns 400
  - [ ] Invalid base64 returns 400
  - [ ] Valid request succeeds
- **Verification:**
  ```bash
  curl -X POST http://localhost:3000/api/ocr -H "Content-Type: application/json" -d '{}'
  # Should return 400 with "Image data too short" or similar
  ```

---

## Phase 1: Math Correctness (BLOCK LAUNCH)

These issues cause incorrect bill splits. Users will dispute results.

---

### MATH-01: Fix Floating-Point Rounding with Integer Cents
- **Severity:** Critical
- **Effort:** M
- **Files:** `hooks/use-bill-split.ts`, `lib/split-math.ts` (new)
- **Task:**  
  Create pure utility for splitting amounts. Work in integer cents. Distribute remainder fairly.
- **Implementation:**
  ```typescript
  // lib/split-math.ts
  export function splitAmountCents(
    amountCents: number,
    participantCount: number
  ): number[] {
    if (participantCount <= 0) return [];
    if (participantCount === 1) return [amountCents];

    const base = Math.floor(amountCents / participantCount);
    const remainder = amountCents % participantCount;

    // First `remainder` people pay 1 cent extra
    return Array.from({ length: participantCount }, (_, i) =>
      base + (i < remainder ? 1 : 0)
    );
  }

  export function centsToDisplay(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  export function priceToCents(price: number): number {
    return Math.round(price * 100);
  }
  ```
  
  Update `use-bill-split.ts`:
  ```typescript
  import { splitAmountCents, priceToCents, centsToDisplay } from "@/lib/split-math";

  const handleCalculate = () => {
    const personTotals: PersonTotal[] = names.map((name) => ({
      name,
      totalCents: 0,
      items: [],
    }));

    items.forEach((item) => {
      if (item.participants.length === 0) return;

      const itemCents = priceToCents(item.price);
      const shares = splitAmountCents(itemCents, item.participants.length);

      item.participants.forEach((participant, i) => {
        const person = personTotals.find((p) => p.name === participant);
        if (person) {
          person.totalCents += shares[i];
          person.items.push({
            name: item.name,
            shareCents: shares[i],
          });
        }
      });
    });

    // Convert back to display format
    setResults(personTotals.map(p => ({
      name: p.name,
      total: p.totalCents / 100,
      items: p.items.map(i => ({
        name: i.name,
        share: i.shareCents / 100,
      })),
    })));
    setStep(4);
  };
  ```
- **Acceptance Criteria:**
  - [ ] $10.00 split 3 ways = $3.34 + $3.33 + $3.33 = $10.00
  - [ ] $25.00 split 3 ways = $8.34 + $8.33 + $8.33 = $25.00
  - [ ] Sum of individual shares always equals item total
  - [ ] Sum of person totals always equals bill total
- **Verification:**
  ```typescript
  // Unit test
  expect(splitAmountCents(1000, 3)).toEqual([334, 333, 333]);
  expect(splitAmountCents(1000, 3).reduce((a, b) => a + b, 0)).toBe(1000);
  expect(splitAmountCents(2500, 3).reduce((a, b) => a + b, 0)).toBe(2500);
  ```

---

### MATH-02: Block Negative Prices in Manual Form
- **Severity:** High
- **Effort:** S
- **Files:** `components/item-form.tsx`, `hooks/use-bill-split.ts`
- **Task:**  
  Validate price is positive before allowing add. Show inline error.
- **Implementation:**
  ```typescript
  // item-form.tsx - add validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty or valid positive numbers only
    if (value === "" || (parseFloat(value) >= 0 && !value.startsWith("-"))) {
      setCurrentItem({ ...currentItem, price: value });
    }
  };

  // use-bill-split.ts - strengthen validation
  const isValidItem = () => {
    const price = Number.parseFloat(currentItem.price);
    return (
      currentItem.name.trim() !== "" &&
      !isNaN(price) &&
      price > 0 &&
      selectedParticipants.length > 0
    );
  };
  ```
- **Acceptance Criteria:**
  - [ ] Typing "-5" shows nothing (blocked)
  - [ ] Typing "0" disables Add button
  - [ ] Typing "0.01" enables Add button
- **Verification:**  
  Manual test: attempt to enter negative price, verify blocked.

---

### MATH-03: Validate Names are Unique (Case-Insensitive)
- **Severity:** Medium
- **Effort:** S
- **Files:** `hooks/use-bill-split.ts`
- **Task:**  
  Normalize names to lowercase for uniqueness check.
- **Implementation:**
  ```typescript
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
  ```
- **Acceptance Criteria:**
  - [ ] "John" and "john" in same list = validation error
  - [ ] "John" and "Jane" = valid
- **Verification:**  
  Enter "Alice" and "alice", verify error message appears.

---

### MATH-04: Reject Whitespace-Only Names
- **Severity:** Medium
- **Effort:** S
- **Files:** `hooks/use-bill-split.ts`
- **Task:**  
  Already trimming, but ensure empty after trim is rejected.
- **Implementation:**
  ```typescript
  const isValidNames = () => {
    const trimmedNames = currentNames.map((name) => name.trim());
    const nonEmptyNames = trimmedNames.filter((name) => name.length > 0);
    const uniqueNames = new Set(
      nonEmptyNames.map((name) => name.toLowerCase())
    );
    return (
      nonEmptyNames.length === Number.parseInt(numberOfPeople) &&
      uniqueNames.size === nonEmptyNames.length
    );
  };
  ```
- **Acceptance Criteria:**
  - [ ] "   " (spaces only) = validation error
  - [ ] "Alice" = valid
- **Verification:**  
  Enter only spaces in name field, verify Next is disabled.

---

## Phase 2: Reliability & Error Handling

These issues cause poor UX when things go wrong.

---

### REL-01: Add Confirmation Dialog for Reset
- **Severity:** High
- **Effort:** S
- **Files:** `components/results-step.tsx`, `components/ui/alert-dialog.tsx` (new)
- **Task:**  
  Add Radix AlertDialog before reset. Require explicit confirmation.
- **Implementation:**
  ```bash
  npx shadcn@latest add alert-dialog
  ```
  ```typescript
  // results-step.tsx
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" className="...">
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Start Over?</AlertDialogTitle>
        <AlertDialogDescription>
          This will clear all items and participants. You cannot undo this.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onReset}>Yes, Reset</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```
- **Acceptance Criteria:**
  - [ ] Tapping Reset shows confirmation dialog
  - [ ] Cancel closes dialog, no reset
  - [ ] Confirm resets state
- **Verification:**  
  Tap Reset, tap Cancel, verify still on results page.

---

### REL-02: Add Undo for Item Delete
- **Severity:** Medium
- **Effort:** M
- **Files:** `components/items-list.tsx`, `hooks/use-bill-split.ts`, `package.json`
- **Task:**  
  Install sonner. Show toast with undo when item deleted. Restore on undo.
- **Implementation:**
  ```bash
  npm install sonner
  ```
  ```typescript
  // app/layout.tsx - add Toaster
  import { Toaster } from "sonner";
  // In body: <Toaster position="bottom-center" />

  // hooks/use-bill-split.ts
  const [lastDeletedItem, setLastDeletedItem] = useState<Item | null>(null);

  const handleRemoveItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setLastDeletedItem(item);
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const handleRestoreItem = () => {
    if (lastDeletedItem) {
      setItems([...items, lastDeletedItem]);
      setLastDeletedItem(null);
    }
  };

  // items-list.tsx
  import { toast } from "sonner";

  const handleDelete = (id: string) => {
    onRemoveItem(id);
    toast("Item deleted", {
      action: {
        label: "Undo",
        onClick: () => onRestoreItem(),
      },
      duration: 5000,
    });
  };
  ```
- **Acceptance Criteria:**
  - [ ] Deleting item shows toast
  - [ ] Tapping Undo restores item
  - [ ] Toast disappears after 5s
- **Verification:**  
  Delete item, tap Undo within 5s, verify item restored.

---

### REL-03: Prevent Double OCR Submission
- **Severity:** Medium
- **Effort:** S
- **Files:** `components/receipt-scanner.tsx`
- **Task:**  
  Disable capture button immediately on tap. Use ref to track in-flight request.
- **Implementation:**
  ```typescript
  const isProcessingRef = useRef(false);

  const capturePhoto = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // ... existing capture logic ...

    // Reset at end of processReceipt or on error
  }, [processReceipt, stopCamera]);
  ```
  Also in JSX:
  ```typescript
  <button
    onClick={capturePhoto}
    disabled={cameraState !== "active" || status === "processing"}
    // ...
  >
  ```
- **Acceptance Criteria:**
  - [ ] Rapid double-tap fires only one OCR request
  - [ ] Button disabled during processing
- **Verification:**  
  Double-tap capture, check network tab for single request.

---

### REL-04: Add AbortController to Receipt Scanner Hook
- **Severity:** Medium
- **Effort:** S
- **Files:** `hooks/use-receipt-scanner.ts`
- **Task:**  
  Create AbortController per request. Abort on unmount or new request.
- **Implementation:**
  ```typescript
  const abortControllerRef = useRef<AbortController | null>(null);

  const processReceipt = useCallback(async (imageData: string) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setError(null);
      setStatus("processing");

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
        signal: controller.signal,
      });

      // ... rest of handler
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Silently ignore aborted requests
        return [];
      }
      // ... rest of error handling
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  ```
- **Acceptance Criteria:**
  - [ ] Closing scanner mid-request aborts fetch
  - [ ] Starting new scan aborts previous
  - [ ] No error shown for aborted requests
- **Verification:**  
  Start scan, close immediately, verify no error state.

---

### REL-05: Use crypto.randomUUID for Item IDs
- **Severity:** Low
- **Effort:** S
- **Files:** `hooks/use-bill-split.ts`
- **Task:**  
  Replace `Date.now().toString()` with `crypto.randomUUID()`.
- **Implementation:**
  ```typescript
  const newItem: Item = {
    id: crypto.randomUUID(),
    name: currentItem.name.trim(),
    // ...
  };
  ```
- **Acceptance Criteria:**
  - [ ] IDs are valid UUIDs
  - [ ] No collisions in 1000 rapid additions
- **Verification:**  
  Add 10 items rapidly, verify all have unique UUIDs.

---

### REL-06: Replace alert() with Toast for Share Fallback
- **Severity:** Low
- **Effort:** S
- **Files:** `components/results-step.tsx`
- **Task:**  
  Replace `alert()` with toast notification.
- **Implementation:**
  ```typescript
  import { toast } from "sonner";

  const handleShare = async (type: "simple" | "full") => {
    const shareText = type === "simple" ? generateSimpleBill() : generateFullBill();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Bill Split", text: shareText });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy. Please copy manually.");
      }
    }
  };
  ```
- **Acceptance Criteria:**
  - [ ] Fallback shows toast, not alert
  - [ ] Toast auto-dismisses
- **Verification:**  
  Test on desktop (no Web Share API), verify toast appears.

---

## Phase 3: Testing Foundation

Zero tests is unacceptable. Add minimum viable test coverage.

---

### TEST-01: Set Up Testing Framework
- **Severity:** Critical
- **Effort:** M
- **Files:** `package.json`, `jest.config.js` (new), `jest.setup.js` (new)
- **Task:**  
  Install Jest + React Testing Library. Configure for Next.js.
- **Implementation:**
  ```bash
  npm install -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
  ```
  ```javascript
  // jest.config.js
  const nextJest = require("next/jest");
  const createJestConfig = nextJest({ dir: "./" });
  
  module.exports = createJestConfig({
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
    },
  });
  ```
  ```javascript
  // jest.setup.js
  import "@testing-library/jest-dom";
  ```
  ```json
  // package.json scripts
  "test": "jest",
  "test:watch": "jest --watch"
  ```
- **Acceptance Criteria:**
  - [ ] `npm test` runs without error
  - [ ] Sample test passes
- **Verification:**
  ```bash
  npm test
  ```

---

### TEST-02: Unit Tests for Split Math
- **Severity:** Critical
- **Effort:** M
- **Files:** `lib/split-math.test.ts` (new)
- **Task:**  
  Write comprehensive tests for splitting logic.
- **Implementation:**
  ```typescript
  // lib/split-math.test.ts
  import { splitAmountCents, priceToCents, centsToDisplay } from "./split-math";

  describe("splitAmountCents", () => {
    it("splits evenly when divisible", () => {
      expect(splitAmountCents(1000, 2)).toEqual([500, 500]);
      expect(splitAmountCents(900, 3)).toEqual([300, 300, 300]);
    });

    it("distributes remainder to first participants", () => {
      expect(splitAmountCents(1000, 3)).toEqual([334, 333, 333]);
      expect(splitAmountCents(100, 3)).toEqual([34, 33, 33]);
      expect(splitAmountCents(1, 3)).toEqual([1, 0, 0]);
    });

    it("sum always equals original amount", () => {
      for (let amount = 1; amount <= 100; amount++) {
        for (let people = 1; people <= 10; people++) {
          const shares = splitAmountCents(amount, people);
          expect(shares.reduce((a, b) => a + b, 0)).toBe(amount);
        }
      }
    });

    it("handles single participant", () => {
      expect(splitAmountCents(1000, 1)).toEqual([1000]);
    });

    it("handles zero participants", () => {
      expect(splitAmountCents(1000, 0)).toEqual([]);
    });
  });

  describe("priceToCents", () => {
    it("converts dollars to cents", () => {
      expect(priceToCents(10.00)).toBe(1000);
      expect(priceToCents(10.99)).toBe(1099);
      expect(priceToCents(0.01)).toBe(1);
    });

    it("rounds floating point errors", () => {
      expect(priceToCents(10.555)).toBe(1056); // rounds to nearest
    });
  });

  describe("centsToDisplay", () => {
    it("formats cents as dollars", () => {
      expect(centsToDisplay(1000)).toBe("10.00");
      expect(centsToDisplay(1)).toBe("0.01");
      expect(centsToDisplay(1099)).toBe("10.99");
    });
  });
  ```
- **Acceptance Criteria:**
  - [ ] All tests pass
  - [ ] 100% coverage on split-math.ts
- **Verification:**
  ```bash
  npm test -- --coverage lib/split-math.test.ts
  ```

---

### TEST-03: Unit Tests for Validation Functions
- **Severity:** High
- **Effort:** S
- **Files:** `hooks/use-bill-split.test.ts` (new)
- **Task:**  
  Test `isValidNumberOfPeople`, `isValidNames`, `isValidItem`.
- **Implementation:**
  ```typescript
  // Extract validation to pure functions first, then test
  describe("isValidNumberOfPeople", () => {
    it("rejects 0", () => expect(isValidNumberOfPeople("0")).toBe(false));
    it("rejects 1", () => expect(isValidNumberOfPeople("1")).toBe(false));
    it("accepts 2", () => expect(isValidNumberOfPeople("2")).toBe(true));
    it("accepts 20", () => expect(isValidNumberOfPeople("20")).toBe(true));
    it("rejects 21", () => expect(isValidNumberOfPeople("21")).toBe(false));
    it("rejects non-numeric", () => expect(isValidNumberOfPeople("abc")).toBe(false));
  });

  describe("isValidNames", () => {
    it("rejects duplicates", () => {
      expect(isValidNames(["Alice", "Alice"], 2)).toBe(false);
    });
    it("rejects case-insensitive duplicates", () => {
      expect(isValidNames(["Alice", "alice"], 2)).toBe(false);
    });
    it("rejects whitespace-only", () => {
      expect(isValidNames(["Alice", "   "], 2)).toBe(false);
    });
    it("accepts valid names", () => {
      expect(isValidNames(["Alice", "Bob"], 2)).toBe(true);
    });
  });
  ```
- **Acceptance Criteria:**
  - [ ] All validation edge cases tested
  - [ ] Tests pass
- **Verification:**
  ```bash
  npm test use-bill-split.test.ts
  ```

---

### TEST-04: Integration Test for Full Flow
- **Severity:** High
- **Effort:** M
- **Files:** `__tests__/integration/bill-split-flow.test.tsx` (new)
- **Task:**  
  Test complete flow from start to results.
- **Implementation:**
  ```typescript
  import { render, screen, fireEvent } from "@testing-library/react";
  import PosaXrosto from "@/app/page";

  describe("Bill Split Flow", () => {
    it("completes full flow with correct math", async () => {
      render(<PosaXrosto />);
      
      // Start
      fireEvent.click(screen.getByText("Start Splitting"));
      
      // Select 2 people
      fireEvent.click(screen.getByText("2"));
      fireEvent.click(screen.getByText("Next Step"));
      
      // Enter names
      const inputs = screen.getAllByPlaceholderText(/Person/);
      fireEvent.change(inputs[0], { target: { value: "Alice" } });
      fireEvent.change(inputs[1], { target: { value: "Bob" } });
      fireEvent.click(screen.getByText("Next Step"));
      
      // Add item via FAB
      fireEvent.click(screen.getByRole("button", { name: /add/i }));
      // ... complete form ...
      
      // Calculate
      fireEvent.click(screen.getByText("Calculate Split"));
      
      // Verify results
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("$5.00")).toBeInTheDocument();
    });
  });
  ```
- **Acceptance Criteria:**
  - [ ] Full flow test passes
  - [ ] Verifies correct totals
- **Verification:**
  ```bash
  npm test bill-split-flow.test.tsx
  ```

---

## Phase 4: Observability & DevOps

Needed to debug issues in production.

---

### OBS-01: Add Sentry Error Tracking
- **Severity:** High
- **Effort:** M
- **Files:** `package.json`, `sentry.client.config.ts` (new), `next.config.mjs`, `app/layout.tsx`
- **Task:**  
  Install Sentry SDK. Configure for Next.js 15.
- **Implementation:**
  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```
  Follow wizard prompts. Add `SENTRY_DSN` to environment.
- **Acceptance Criteria:**
  - [ ] Errors appear in Sentry dashboard
  - [ ] Source maps uploaded on build
- **Verification:**  
  Throw test error, verify appears in Sentry.

---

### OBS-02: Create .env.example
- **Severity:** Medium
- **Effort:** S
- **Files:** `.env.example` (new)
- **Task:**  
  Document required environment variables.
- **Implementation:**
  ```bash
  # .env.example
  # OpenAI API key for receipt scanning
  OPENAI_API_KEY=sk-...

  # Optional: Sentry DSN for error tracking
  SENTRY_DSN=https://...

  # Optional: Upstash Redis for rate limiting
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...
  ```
- **Acceptance Criteria:**
  - [ ] File exists with all required vars
  - [ ] Comments explain each var
- **Verification:**  
  New developer can set up by copying `.env.example` to `.env.local`.

---

### OBS-03: Fix Service Worker Cache Versioning
- **Severity:** High
- **Effort:** S
- **Files:** `public/sw.js`, build script
- **Task:**  
  Make cache version dynamic based on build.
- **Implementation:**
  ```javascript
  // public/sw.js
  const CACHE_VERSION = "v1"; // Will be replaced at build time
  const CACHE_NAME = `posa-xrosto-${CACHE_VERSION}`;
  ```
  
  Add build script to inject version:
  ```json
  // package.json
  "scripts": {
    "build": "node scripts/inject-sw-version.js && next build"
  }
  ```
  ```javascript
  // scripts/inject-sw-version.js
  const fs = require("fs");
  const version = Date.now().toString(36);
  let sw = fs.readFileSync("public/sw.js", "utf8");
  sw = sw.replace('const CACHE_VERSION = "v1"', `const CACHE_VERSION = "${version}"`);
  fs.writeFileSync("public/sw.js", sw);
  ```
- **Acceptance Criteria:**
  - [ ] Each build has unique cache name
  - [ ] Old caches deleted on activate
- **Verification:**  
  Build twice, compare `CACHE_NAME` in output.

---

### OBS-04: Add Offline Mode Banner
- **Severity:** Medium
- **Effort:** S
- **Files:** `components/offline-banner.tsx` (new), `app/layout.tsx`
- **Task:**  
  Detect offline status. Show non-intrusive banner.
- **Implementation:**
  ```typescript
  // components/offline-banner.tsx
  "use client";
  
  import { useState, useEffect } from "react";
  import { WifiOff } from "lucide-react";
  import { motion, AnimatePresence } from "framer-motion";

  export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      setIsOffline(!navigator.onLine);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);

    return (
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-warning text-neutral-900 py-2 px-4 text-center text-sm font-medium"
          >
            <WifiOff className="w-4 h-4 inline mr-2" />
            You're offline. Some features may not work.
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  ```
- **Acceptance Criteria:**
  - [ ] Banner appears when offline
  - [ ] Banner disappears when back online
  - [ ] Banner doesn't block content
- **Verification:**  
  Toggle airplane mode, verify banner appears/disappears.

---

## Phase 5: UX Polish

Nice-to-have improvements after core issues fixed.

---

### UX-01: Add Bulk Assign for Scanned Items
- **Severity:** Medium
- **Effort:** M
- **Files:** `components/items-list.tsx`, `hooks/use-bill-split.ts`
- **Task:**  
  Add "Assign All to Everyone" button above unassigned items.
- **Acceptance Criteria:**
  - [ ] Button appears when any item has no participants
  - [ ] Clicking assigns all names to all unassigned items
- **Verification:**  
  Scan receipt, tap button, verify all items assigned.

---

### UX-02: Add Edit Item Feature
- **Severity:** Medium
- **Effort:** M
- **Files:** `components/items-list.tsx`, `components/edit-item-sheet.tsx` (new)
- **Task:**  
  Tap item to open edit sheet. Allow changing name/price.
- **Acceptance Criteria:**
  - [ ] Tapping item opens edit sheet
  - [ ] Can change name and price
  - [ ] Save updates item in list
- **Verification:**  
  Add item, tap to edit, change price, verify updated.

---

### UX-03: Compress Images Before Upload
- **Severity:** Medium
- **Effort:** M
- **Files:** `components/receipt-scanner.tsx`
- **Task:**  
  Resize images to max 1920px wide. Compress to 80% quality.
- **Implementation:**
  ```typescript
  const compressImage = (
    canvas: HTMLCanvasElement,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): string => {
    let width = canvas.width;
    let height = canvas.height;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");
    ctx?.drawImage(canvas, 0, 0, width, height);

    return tempCanvas.toDataURL("image/jpeg", quality);
  };
  ```
- **Acceptance Criteria:**
  - [ ] 10MB photo compressed to < 1MB
  - [ ] Quality still readable by OCR
- **Verification:**  
  Upload large photo, check network payload size.

---

### UX-04: Add Privacy Notice Before Camera
- **Severity:** Medium
- **Effort:** S
- **Files:** `components/receipt-scanner.tsx`
- **Task:**  
  Show one-time notice explaining data handling before first camera use.
- **Acceptance Criteria:**
  - [ ] Notice shown on first use
  - [ ] "Got it" dismisses and stores in localStorage
  - [ ] Not shown again after dismissed
- **Verification:**  
  Clear localStorage, open scanner, verify notice appears.

---

### UX-05: Add Skip Link for Accessibility
- **Severity:** Low
- **Effort:** S
- **Files:** `app/layout.tsx`
- **Task:**  
  Add visually hidden skip link to main content.
- **Implementation:**
  ```typescript
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
  >
    Skip to main content
  </a>
  // ... later ...
  <main id="main-content">
    {children}
  </main>
  ```
- **Acceptance Criteria:**
  - [ ] Tab focuses skip link first
  - [ ] Activating skips to main content
  - [ ] Invisible until focused
- **Verification:**  
  Tab through page, verify skip link appears and works.

---

## Phase 6: Future Improvements (Post-Launch)

Track but don't prioritize before launch.

---

### FUT-01: Add i18n (Greek + English)
- **Severity:** Low
- **Effort:** XL
- **Notes:** Use next-intl or react-i18next. Extract all strings.

### FUT-02: Add Persistence (LocalStorage or DB)
- **Severity:** Low
- **Effort:** L
- **Notes:** Save current session to localStorage. Restore on reload.

### FUT-03: Add API Versioning
- **Severity:** Low
- **Effort:** M
- **Notes:** Move `/api/ocr` to `/api/v1/ocr`. Add version header.

### FUT-04: Add OpenAPI Spec
- **Severity:** Low
- **Effort:** M
- **Notes:** Document `/api/ocr` with OpenAPI 3.0 spec.

### FUT-05: Add E2E Tests with Playwright
- **Severity:** Medium
- **Effort:** L
- **Notes:** Test full flows in real browser.

### FUT-06: Add Security Headers (CSP, CORS)
- **Severity:** Medium
- **Effort:** M
- **Notes:** Add Content-Security-Policy, restrict CORS to production domain.

---

## Progress Tracker

### Phase 0: Critical Security
- [ ] SEC-01: Rate limiting
- [ ] SEC-02: Payload size limit
- [ ] SEC-03: Request timeout
- [ ] SEC-04: Remove PII from logs
- [ ] SEC-05: Input schema validation

### Phase 1: Math Correctness
- [ ] MATH-01: Integer cents rounding
- [ ] MATH-02: Block negative prices
- [ ] MATH-03: Case-insensitive name uniqueness
- [ ] MATH-04: Reject whitespace names

### Phase 2: Reliability
- [ ] REL-01: Reset confirmation
- [ ] REL-02: Undo item delete
- [ ] REL-03: Prevent double OCR
- [ ] REL-04: AbortController in scanner
- [ ] REL-05: UUID for item IDs
- [ ] REL-06: Toast for share fallback

### Phase 3: Testing
- [ ] TEST-01: Set up Jest
- [ ] TEST-02: Split math tests
- [ ] TEST-03: Validation tests
- [ ] TEST-04: Integration test

### Phase 4: Observability
- [ ] OBS-01: Sentry
- [ ] OBS-02: .env.example
- [ ] OBS-03: SW cache versioning
- [ ] OBS-04: Offline banner

### Phase 5: UX Polish
- [ ] UX-01: Bulk assign
- [ ] UX-02: Edit item
- [ ] UX-03: Image compression
- [ ] UX-04: Privacy notice
- [ ] UX-05: Skip link

---

## Definition of Done

An item is complete when:

1. Code implemented and compiles without errors
2. Acceptance criteria verified manually
3. No regressions in existing functionality
4. Committed with descriptive message referencing item ID
5. Checkbox marked `[x]` in this document

---

*Last updated: 2026-01-30*
