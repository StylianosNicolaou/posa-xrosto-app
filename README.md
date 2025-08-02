# Posa Xrosto - Bill Splitter App

A Progressive Web App (PWA) that helps people split restaurant bills when sharing dishes. The name "Posa Xrosto" is Greek for "How much do I owe?"

## Features

- **Smart Bill Splitting**: Calculates individual shares based on who actually shared each dish
- **Receipt Scanner**: Scan restaurant receipts using Google Cloud Vision API for automatic item extraction
- **PWA Support**: Can be installed on mobile devices and works offline
- **Mobile-Optimized**: Built with responsive design for mobile usage
- **Share Results**: Users can share the split results via native sharing or clipboard

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **OCR Service**: Google Cloud Vision API
- **State Management**: React hooks with custom `useBillSplit` hook

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Google Cloud account with Vision API enabled

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd posa-xrosto
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up Google Cloud Vision API:

   a. Create a Google Cloud project at [Google Cloud Console](https://console.cloud.google.com/)

   b. Enable the Vision API for your project

   c. Create a service account and download the JSON key file

   d. Copy the key file to the project root as `google-cloud-key.json`

4. Create environment file:

```bash
cp env.example .env.local
```

5. Update `.env.local` with your Google Cloud credentials:

```bash
# Option 1: Path to your service account key file
GOOGLE_CLOUD_KEY_FILE=./google-cloud-key.json

# Option 2: Or paste the entire JSON credentials as a string
# GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...}
```

6. Run the development server:

```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## OCR Receipt Scanner Setup

### Google Cloud Vision API Setup

1. **Create a Google Cloud Project**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable the Vision API**:

   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create a Service Account**:

   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name like "posa-xrosto-ocr"
   - Grant "Cloud Vision API User" role
   - Create and download the JSON key file

4. **Configure Credentials**:
   - Place the downloaded JSON file in your project root as `google-cloud-key.json`
   - Or copy the JSON content to the `GOOGLE_CLOUD_CREDENTIALS` environment variable

### OCR Features

The receipt scanner includes:

- **Receipt Validation**: Ensures the image is actually a receipt
- **Item Recognition**: Identifies food items and their prices
- **Price Extraction**: Uses multiple patterns to extract prices accurately
- **Error Handling**: Comprehensive error handling for various failure scenarios
- **Food Item Database**: Recognizes common restaurant items

### Supported Receipt Formats

The OCR service works best with:

- Clear, well-lit receipt images
- Standard restaurant receipt layouts
- Items with prices clearly visible
- Receipts from restaurants, cafes, bars, etc.

## Usage

### Basic Bill Splitting

1. **Start the app** and click "Start Splitting"
2. **Enter the number of people** (2-20)
3. **Add everyone's names**
4. **Add items manually** or use the receipt scanner
5. **Select who shared each item**
6. **Calculate the split** to see individual totals

### Receipt Scanning

1. **Click "Scan Receipt"** in the items management step
2. **Allow camera permissions** when prompted
3. **Position the receipt** within the scanning area
4. **Click "Capture & Scan"** to process the receipt
5. **Review the extracted items** and confirm
6. **Items are added** with all participants selected by default
7. **Adjust participants** as needed for each item

## Development

### Project Structure

```
posa-xrosto/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ocr/          # OCR processing endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── item-form.tsx     # Item input form
│   ├── items-list.tsx    # Items display
│   ├── receipt-scanner.tsx # Receipt scanner UI
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   ├── use-bill-split.ts # Main app logic
│   └── use-receipt-scanner.ts # Receipt scanner logic
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

### Key Components

- **`useBillSplit`**: Main state management and business logic
- **`useReceiptScanner`**: Camera and OCR processing logic
- **`ReceiptScanner`**: UI for receipt scanning
- **`/api/ocr`**: Backend OCR processing endpoint

### Environment Variables

- `GOOGLE_CLOUD_KEY_FILE`: Path to Google Cloud service account key file
- `GOOGLE_CLOUD_CREDENTIALS`: JSON string of Google Cloud credentials

## Deployment

### Vercel Deployment

1. **Push to GitHub**:

```bash
git add .
git commit -m "Add OCR integration"
git push origin main
```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

### Environment Variables for Production

Set these in your deployment platform:

- `GOOGLE_CLOUD_CREDENTIALS`: The full JSON string of your service account credentials

## Troubleshooting

### OCR Issues

- **"Camera not supported"**: Ensure you're using a modern browser with camera support
- **"Camera access denied"**: Allow camera permissions in your browser
- **"No text detected"**: Try a clearer, better-lit receipt image
- **"Not a receipt"**: Ensure the image contains receipt-like text (totals, items, etc.)
- **"Authentication failed"**: Check your Google Cloud credentials

### Common Issues

- **Build errors**: Ensure all dependencies are installed with `pnpm install`
- **TypeScript errors**: Run `pnpm lint` to check for issues
- **PWA not installing**: Check the manifest.json and service worker configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
