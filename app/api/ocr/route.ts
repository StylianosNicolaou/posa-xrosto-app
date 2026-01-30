import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  restaurant?: string;
  date?: string;
}

const EXTRACTION_PROMPT = `You are an expert receipt parser. Extract all purchased items from this receipt image.

## CRITICAL RULES

### What to EXTRACT:
- Menu items, food, drinks, products that were purchased
- The QUANTITY shown (number before item name, e.g., "3" in "3 PIZZA")
- The EXACT PRICE shown on the receipt for that line (this is always the TOTAL for that line, NOT per-unit)

### What to IGNORE completely:
- Restaurant name, address, phone, table number, server, check number
- Dates, times, transaction IDs
- Subtotal, Total, Tax, Tip, Gratuity, Service Charge, Discounts
- "Thank you" messages, footer text

### PRICE EXTRACTION RULE (VERY IMPORTANT):
The price shown next to an item is the LINE TOTAL (quantity × unit price).
- Example: "3 PIZZA 45.00" means 3 pizzas for $45.00 total
- You must return: {"name": "Pizza", "price": 45.00, "quantity": 3}
- DO NOT divide the price by quantity. Use the exact price shown.

### QUANTITY RULE:
- Look for a number at the START of the line (e.g., "3 LASAGNA" = quantity 3)
- If no quantity shown, assume quantity is 1
- Always include the quantity field, even if it's 1

## OUTPUT FORMAT
Return ONLY valid JSON, no markdown code blocks, no explanation:
{
  "items": [
    {"name": "Item Name", "price": 45.00, "quantity": 3},
    {"name": "Another Item", "price": 12.50, "quantity": 1}
  ],
  "restaurant": "Restaurant Name or null",
  "date": "Date string or null"
}

If no items found: {"items": [], "error": "Could not identify any menu items"}`;

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 },
      );
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("No OpenAI API key found");
      return NextResponse.json(
        {
          error:
            "Receipt scanning service not configured. Please add OPENAI_API_KEY to environment variables.",
        },
        { status: 500 },
      );
    }

    console.log("Starting GPT-4o Vision processing...");

    // Ensure the image data has the proper data URL format
    let imageUrl = imageData;
    if (!imageData.startsWith("data:")) {
      imageUrl = `data:image/jpeg;base64,${imageData}`;
    }

    // Call GPT-4o Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent parsing
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error("No response from GPT-4o");
      return NextResponse.json(
        { error: "Failed to analyze receipt. Please try again." },
        { status: 500 },
      );
    }

    console.log("GPT-4o Response:", content);

    // Parse the JSON response
    let parsedData: ReceiptData & { error?: string };
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse GPT response:", content);
      return NextResponse.json(
        {
          error:
            "Failed to parse receipt data. Please try again with a clearer image.",
        },
        { status: 400 },
      );
    }

    // Check for extraction errors
    if (parsedData.error) {
      return NextResponse.json({ error: parsedData.error }, { status: 400 });
    }

    // Validate items
    if (!parsedData.items || parsedData.items.length === 0) {
      return NextResponse.json(
        {
          error:
            "No items could be extracted from the receipt. Please ensure the receipt is clear and shows item prices.",
        },
        { status: 400 },
      );
    }

    // Clean and validate items
    const validItems: ReceiptItem[] = parsedData.items
      .filter((item) => {
        return (
          item.name &&
          typeof item.name === "string" &&
          item.name.length > 0 &&
          typeof item.price === "number" &&
          item.price > 0
        );
      })
      .map((item) => ({
        name: item.name.trim(),
        price: Math.round(item.price * 100) / 100, // Round to 2 decimal places
        quantity:
          item.quantity && item.quantity > 1 ? item.quantity : undefined,
      }));

    if (validItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid items found in the receipt. Please try again with a clearer image.",
        },
        { status: 400 },
      );
    }

    // Calculate total from items
    const total = validItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );

    console.log(`Successfully extracted ${validItems.length} items`);

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        total: Math.round(total * 100) / 100,
        restaurant: parsedData.restaurant,
        date: parsedData.date,
      },
    });
  } catch (error) {
    console.error("Receipt processing error:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);

      // Handle specific OpenAI errors
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your OpenAI API key." },
          { status: 401 },
        );
      }
      if (error.message.includes("quota") || error.message.includes("rate")) {
        return NextResponse.json(
          { error: "API rate limit reached. Please try again in a moment." },
          { status: 429 },
        );
      }
      if (error.message.includes("billing")) {
        return NextResponse.json(
          {
            error:
              "OpenAI billing issue. Please check your OpenAI account has credits.",
          },
          { status: 402 },
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Failed to process receipt. Please try again with a clearer image.",
      },
      { status: 500 },
    );
  }
}
