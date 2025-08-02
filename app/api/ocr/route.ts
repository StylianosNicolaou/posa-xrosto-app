import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initialize the Vision API client
const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || undefined,
  credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    : undefined,
});

interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  tax?: number;
  tip?: number;
  subtotal?: number;
  restaurant?: string;
  date?: string;
}

// Common food items and their variations for better recognition
const FOOD_ITEMS = [
  "salad",
  "caesar",
  "chicken",
  "beef",
  "pork",
  "fish",
  "pasta",
  "pizza",
  "burger",
  "sandwich",
  "soup",
  "appetizer",
  "dessert",
  "coffee",
  "tea",
  "soda",
  "water",
  "bread",
  "garlic",
  "fries",
  "rice",
  "noodles",
  "steak",
  "shrimp",
  "lobster",
  "wine",
  "beer",
  "cocktail",
  "margarita",
  "martini",
  "whiskey",
  "vodka",
  "ice cream",
  "cake",
  "pie",
  "cookie",
  "brownie",
  "cheesecake",
];

// Price patterns for better extraction
const PRICE_PATTERNS = [
  /\$(\d+\.\d{2})/g, // $12.99
  /(\d+\.\d{2})/g, // 12.99
  /\$(\d+)/g, // $12
  /(\d+)/g, // 12
];

function isReceipt(text: string): boolean {
  const receiptKeywords = [
    "receipt",
    "total",
    "subtotal",
    "tax",
    "tip",
    "amount",
    "payment",
    "restaurant",
    "cafe",
    "diner",
    "grill",
    "kitchen",
    "bar",
    "pub",
    "menu",
    "order",
    "bill",
    "check",
    "tab",
    "due",
    "balance",
  ];

  const lowerText = text.toLowerCase();
  const keywordMatches = receiptKeywords.filter((keyword) =>
    lowerText.includes(keyword)
  );

  return keywordMatches.length >= 2;
}

function extractItems(text: string): ReceiptItem[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    // Skip lines that are likely headers, totals, or tax info
    if (
      line.toLowerCase().includes("total") ||
      line.toLowerCase().includes("tax") ||
      line.toLowerCase().includes("tip") ||
      line.toLowerCase().includes("subtotal") ||
      line.toLowerCase().includes("amount") ||
      line.toLowerCase().includes("due")
    ) {
      continue;
    }

    // Look for price patterns
    let price = 0;
    let priceMatch = null;

    for (const pattern of PRICE_PATTERNS) {
      const matches = line.match(pattern);
      if (matches && matches.length > 0) {
        priceMatch = matches[matches.length - 1]; // Take the last price in the line
        price = parseFloat(priceMatch);
        break;
      }
    }

    if (price > 0 && price < 1000) {
      // Reasonable price range
      // Extract item name (everything before the price)
      let itemName = line;
      if (priceMatch) {
        itemName = line.replace(priceMatch, "").trim();
        // Remove common separators
        itemName = itemName.replace(/[x×]\s*\d+/g, "").trim(); // Remove quantity indicators
        itemName = itemName.replace(/^\d+\s*/, "").trim(); // Remove leading numbers
      }

      // Clean up the item name
      itemName = itemName.replace(/[^\w\s]/g, " ").trim();

      // Only add if it looks like a food item
      if (itemName.length > 2 && itemName.length < 50) {
        const lowerName = itemName.toLowerCase();
        const isFoodItem =
          FOOD_ITEMS.some((food) => lowerName.includes(food)) ||
          lowerName.includes("item") ||
          lowerName.includes("dish") ||
          lowerName.includes("plate");

        if (isFoodItem || itemName.length > 3) {
          items.push({
            name: itemName,
            price: price,
          });
        }
      }
    }
  }

  return items;
}

function extractReceiptData(text: string): ReceiptData {
  const items = extractItems(text);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    items,
    total,
    restaurant: extractRestaurantName(text),
    date: extractDate(text),
  };
}

function extractRestaurantName(text: string): string | undefined {
  const lines = text.split("\n");
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 3 && cleanLine.length < 50) {
      // Look for lines that might be restaurant names
      if (
        !cleanLine.toLowerCase().includes("total") &&
        !cleanLine.toLowerCase().includes("tax") &&
        !cleanLine.toLowerCase().includes("receipt") &&
        !cleanLine.match(/\d/)
      ) {
        return cleanLine;
      }
    }
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
    /\d{1,2}-\d{1,2}-\d{2,4}/g,
    /\d{4}-\d{2}-\d{2}/g,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();
    
    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }
    
    // Check if credentials are available
    if (!process.env.GOOGLE_CLOUD_CREDENTIALS && !process.env.GOOGLE_CLOUD_KEY_FILE) {
      console.error("No Google Cloud credentials found");
      return NextResponse.json(
        { error: "OCR service not configured. Please check environment variables." },
        { status: 500 }
      );
    }
    
    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    
    console.log("Starting OCR processing...");
    
    // Perform OCR on the image
    const [result] = await client.textDetection({
      image: {
        content: base64Image,
      },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      return NextResponse.json(
        { error: "No text detected in the image" },
        { status: 400 }
      );
    }

    // Get the full text
    const fullText = detections[0].description || "";

    // Validate that this is actually a receipt
    if (!isReceipt(fullText)) {
      return NextResponse.json(
        {
          error:
            "The image doesn't appear to be a receipt. Please try again with a clear receipt image.",
        },
        { status: 400 }
      );
    }

    // Extract receipt data
    const receiptData = extractReceiptData(fullText);

    if (receiptData.items.length === 0) {
      return NextResponse.json(
        {
          error:
            "No items could be extracted from the receipt. Please ensure the receipt is clear and well-lit.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: receiptData,
      rawText: fullText,
    });
    } catch (error) {
    console.error("OCR processing error:", error);
    
    // Handle specific Google Cloud errors
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          {
            error:
              "OCR service authentication failed. Please check API credentials.",
          },
          { status: 500 }
        );
      }
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "OCR service quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes("credentials")) {
        return NextResponse.json(
          { error: "Google Cloud credentials not found. Please check environment variables." },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error:
          "Failed to process receipt. Please try again with a clearer image.",
      },
      { status: 500 }
    );
  }
}
