# Posa Xrosto - Smart Bill Splitter

<p align="center">
  <strong>The art of splitting bills without breaking friendships.</strong>
</p>

<p align="center">
  A Progressive Web App (PWA) that helps people split restaurant bills fairly when sharing dishes.
  <br />
  The name "Posa Xrosto" (Πόσα Χρωστώ;) is Greek for "How much do I owe?"
</p>

---

## Overview

**Posa Xrosto** solves the age-old problem of splitting restaurant bills when everyone shares different dishes. Unlike simple bill splitters that divide the total evenly, this app calculates what each person actually owes based on which items they shared.

### The Problem

You're at a restaurant with friends. Someone orders an expensive steak, another person just had a salad, and everyone shared the appetizers. Splitting the bill equally doesn't seem fair, but manually calculating each person's share is a nightmare.

### The Solution

Posa Xrosto lets you:
1. Add all the items from your bill
2. Select who shared each item
3. Get an instant, fair breakdown of what everyone owes

---

## Features

### Core Functionality

- **Smart Per-Item Splitting**: Assign each dish to specific people who shared it. The app calculates individual shares based on actual consumption, not equal division.

- **AI-Powered Receipt Scanning**: Take a photo of your receipt and let GPT-4o Vision automatically extract all items and prices. No manual typing required.

- **Flexible Participant Management**: Support for 2-20 people with customizable names for each group member.

- **Real-Time Calculations**: See running totals update as you add items and assign participants.

- **Share Results**: Export and share the final breakdown via native device sharing or clipboard. Choose between a simple summary (totals only) or full detailed breakdown.

### User Experience

- **Mobile-First Design**: Optimized for phone usage at restaurants with large touch targets and intuitive gestures.

- **PWA Support**: Install as a native-like app on iOS and Android. Works offline once installed.

- **Beautiful UI**: Modern, clean interface with smooth animations using Framer Motion.

- **Step-by-Step Wizard**: Guided flow that walks you through the entire process.

---

## How It Works

### User Flow

```
┌─────────────────┐
│  Welcome Screen │
│  "Start Split"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Number of │
│     People      │
│    (2-20)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enter Names    │
│  for Everyone   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Add Items                   │
│  ┌───────────┐  ┌────────────────┐  │
│  │   Scan    │  │  Manual Entry  │  │
│  │  Receipt  │  │  (+ Button)    │  │
│  └───────────┘  └────────────────┘  │
│                                     │
│  For each item, select who shared   │
│  it using participant chips         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│           Results                   │
│  ┌─────────────────────────────┐    │
│  │  Total Bill: $XXX.XX        │    │
│  └─────────────────────────────┘    │
│  ┌─────────┐ ┌─────────┐            │
│  │ Alice   │ │ Bob     │ ...        │
│  │ $XX.XX  │ │ $XX.XX  │            │
│  │ - Item1 │ │ - Item2 │            │
│  │ - Item2 │ │ - Item3 │            │
│  └─────────┘ └─────────┘            │
│                                     │
│  [Back] [Share] [Reset]             │
└─────────────────────────────────────┘
```

### Split Calculation Logic

The app calculates each person's share using a simple but fair algorithm:

```
For each item:
  share_per_person = item_price / number_of_participants_who_shared_it

For each person:
  total_owed = sum of all their shares across all items they participated in
```

**Example:**
- Pizza ($20) shared by Alice, Bob, Carol → Each pays $6.67
- Steak ($40) only Bob → Bob pays $40
- Appetizer ($15) shared by everyone → Each pays $5

**Result:**
- Alice: $6.67 + $5 = $11.67
- Bob: $6.67 + $40 + $5 = $51.67
- Carol: $6.67 + $5 = $11.67

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 18** | UI component library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Radix-based UI components |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Icon library |

### Backend / API
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **OpenAI GPT-4o Vision** | AI-powered receipt OCR |

### PWA
| Technology | Purpose |
|------------|---------|
| **Web App Manifest** | PWA metadata and icons |
| **Service Worker** | Offline support and caching |

---

## Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **pnpm** (or npm/yarn)
- **OpenAI API Key** (for receipt scanning feature)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd posa-xrosto
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```

4. **Configure OpenAI API (for receipt scanning):**
   
   Edit `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```
   
   > **Note:** The receipt scanning feature requires an OpenAI API key with access to GPT-4o Vision. The app works without it, but you'll need to add items manually.

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

6. **Open the app:**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage Guide

### Basic Bill Splitting (Manual Entry)

1. **Start the app** and tap "Start Splitting"
2. **Enter the number of people** in your group (2-20)
3. **Enter everyone's names** (each name must be unique)
4. **Add items** by tapping the floating + button:
   - Enter the item name (e.g., "Margherita Pizza")
   - Enter the price (e.g., "18.99")
   - Select who shared this item by tapping their names
   - Tap "Add Item"
5. **Repeat** for all items on your bill
6. **Review the items list** and adjust participants if needed
7. **Tap "Calculate Split"** to see the results
8. **Share** the results via your preferred method

### Using Receipt Scanner

1. In the items step, tap **"Scan Receipt"** in the header
2. **Allow camera permissions** when prompted (first time only)
3. **Position your receipt** in the camera viewfinder:
   - Ensure good lighting
   - Capture the entire receipt
   - Hold steady while scanning
4. **Tap the capture button** (large circle) to scan
5. **Review extracted items** - the AI will identify all menu items and prices
6. **Tap "Add Items"** to add them to your bill
7. **Assign participants** to each item (they start unassigned)

### Alternative: Gallery Upload

If camera doesn't work or you have an existing photo:
1. Tap the **gallery icon** in the top-right of the scanner
2. **Select a receipt image** from your photo library
3. The app will process it the same way

### Sharing Results

After calculating, you have two sharing options:

- **Full Breakdown**: Shows each person's total with itemized list
- **Totals Only**: Simple summary with just the amounts owed

The app uses native device sharing when available, or copies to clipboard as fallback.

---

## Project Structure

```
posa-xrosto/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── ocr/
│   │       └── route.ts          # Receipt scanning endpoint
│   ├── globals.css               # Global styles & design tokens
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application page
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   └── ...
│   ├── welcome-screen.tsx        # Landing/hero screen
│   ├── number-of-people-step.tsx # Step 1: group size
│   ├── names-entry-step.tsx      # Step 2: enter names
│   ├── items-management-step.tsx # Step 3: add/manage items
│   ├── item-form.tsx             # Form for adding items
│   ├── items-list.tsx            # Display added items
│   ├── receipt-scanner.tsx       # Camera/OCR UI
│   ├── results-step.tsx          # Step 4: final breakdown
│   ├── food-background.tsx       # Decorative background
│   └── theme-provider.tsx        # Theme context
│
├── hooks/                        # Custom React hooks
│   ├── use-bill-split.ts         # Core app state & logic
│   ├── use-receipt-scanner.ts    # OCR processing logic
│   ├── use-pwa-install.ts        # PWA install prompt
│   └── use-toast.ts              # Toast notifications
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # Shared type definitions
│
├── lib/                          # Utilities
│   └── utils.ts                  # Helper functions (cn, etc.)
│
├── public/                       # Static assets
│   ├── icon-192.png              # PWA icon (small)
│   ├── icon-512.png              # PWA icon (large)
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── tailwind.config.ts            # Tailwind configuration
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## Key Components

### State Management: `useBillSplit` Hook

The core application logic lives in a single custom hook that manages:

- **Step navigation** (0-4: welcome → people count → names → items → results)
- **Participant data** (names array, validation)
- **Items collection** (add, remove, toggle participants)
- **Results calculation** (compute per-person totals)

```typescript
const {
  step, setStep,
  names, numberOfPeople,
  items, currentItem,
  selectedParticipants,
  results, totalAmount,
  handleAddItem,
  handleCalculate,
  handleReset,
  // ... more
} = useBillSplit();
```

### Receipt Processing: `/api/ocr` Route

The OCR endpoint uses GPT-4o Vision to:

1. Accept base64 image data
2. Send to OpenAI with detailed extraction prompt
3. Parse structured JSON response
4. Validate and clean extracted items
5. Return formatted item list

The prompt is carefully engineered to:
- Extract only purchasable items (ignore tax, tip, totals)
- Handle various receipt formats and layouts
- Recognize quantities (e.g., "3 BEER" = quantity 3)
- Clean item names (remove codes, proper capitalization)

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `brand-primary` | `#95A2C8` | Primary actions, highlights |
| `brand-secondary` | `#8CAF8C` | Secondary actions, success |
| `brand-accent` | `#F4D58D` | Accent, rare CTAs |
| `brand-bg` | `#F7F8FB` | Background |
| `slate-text` | `#1E293B` | Primary text |
| `slate-muted` | `#64748B` | Secondary text |

### Typography

- **Headings**: "Clash Display" (variable font)
- **Body**: System font stack

### Component Patterns

- **Cards**: Rounded corners (2rem), subtle borders, backdrop blur
- **Buttons**: Large touch targets (48-64px height), prominent shadows
- **Animations**: Framer Motion with spring easing

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import your repository at [vercel.com](https://vercel.com)
   - Vercel auto-detects Next.js settings

3. **Configure Environment Variables:**
   
   In Vercel dashboard → Settings → Environment Variables:
   ```
   OPENAI_API_KEY=sk-your-production-key
   ```

4. **Deploy:**
   
   Vercel automatically deploys on push to main.

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- **Netlify**: Use `@netlify/plugin-nextjs`
- **Railway**: Direct Next.js support
- **Docker**: Build with `next build && next start`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OCR | OpenAI API key for GPT-4o Vision |

---

## Troubleshooting

### Receipt Scanning Issues

| Problem | Solution |
|---------|----------|
| "Camera not supported" | Use a modern browser (Chrome, Safari, Firefox) |
| "Camera access denied" | Check browser permissions, reload page |
| "No items found" | Ensure receipt is clear, well-lit, fully visible |
| "Scan failed" | Try gallery upload instead of camera |
| "API key error" | Verify `OPENAI_API_KEY` is set correctly |

### Tips for Better OCR Results

1. **Good lighting** - avoid shadows and glare
2. **Steady hands** - hold phone stable while capturing
3. **Full receipt** - include all items in frame
4. **Flat surface** - lay receipt flat if possible
5. **Clear print** - faded receipts may not scan well

### Common Development Issues

| Problem | Solution |
|---------|----------|
| Build errors | Run `pnpm install` to update dependencies |
| TypeScript errors | Run `pnpm lint` to identify issues |
| PWA not installing | Check `manifest.json` and `sw.js` in `/public` |
| Styles not updating | Clear browser cache, restart dev server |

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome (Mobile/Desktop) | Full support |
| Safari (iOS/macOS) | Full support |
| Firefox | Full support |
| Edge | Full support |
| Samsung Internet | Full support |

**Camera Requirements:**
- HTTPS required for camera access (except localhost)
- MediaDevices API must be available

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (ESLint + Prettier)
- Write TypeScript with proper types
- Test on mobile devices before submitting
- Update README for new features

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Radix UI](https://radix-ui.com) for accessible primitives
- [Framer Motion](https://motion.dev) for animations
- [OpenAI](https://openai.com) for GPT-4o Vision API
- [Lucide](https://lucide.dev) for icons

---

<p align="center">
  Made with ❤️ for fair bill splitting everywhere.
  <br />
  <strong>Πόσα Χρωστώ;</strong> — How much do I owe?
</p>
