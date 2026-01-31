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
  currency?: string;
}

const EXTRACTION_PROMPT = `You are an expert receipt parser with 100% accuracy. Extract ALL purchased items from this receipt image.

## YOUR TASK
Identify every item that was purchased and return structured data. Be thorough - missing items means someone doesn't get charged fairly.

## EXTRACTION RULES

### EXTRACT these (purchased items):
- Food items (appetizers, mains, desserts, sides)
- Drinks (alcoholic and non-alcoholic)
- Products/merchandise
- Add-ons, extras, modifications that have a price
- Currency used (EUR, USD, GBP, JPY, CHF, CAD, AUD) based on symbols (€, $, £, ¥, CHF) or country

### NEVER EXTRACT these:
- Restaurant/store name, logo, slogan
- Address, phone, website, email
- Table #, server name, guest count, check #, order #
- Date, time, timestamps
- SUBTOTAL, TOTAL, GRAND TOTAL
- TAX (sales tax, VAT, GST, liquor tax)
- TIP, GRATUITY, SERVICE CHARGE
- DISCOUNT, COUPON, PROMO
- Payment method (VISA, CASH, etc.)
- Balance, change, amount tendered
- "Thank you", "Come again", promotional text
- Loyalty points, rewards

### PRICE RULE (CRITICAL):
The price shown on the receipt is ALWAYS the line total (quantity × unit price).
- NEVER divide by quantity
- NEVER calculate unit prices
- Use the EXACT number shown on the receipt

### QUANTITY RULE:
- Number BEFORE item name = quantity (e.g., "3 BEER" = qty 3)
- Number AFTER item name is usually a code, ignore it
- "x2" or "×3" after name = quantity
- No number shown = quantity 1

### NAME CLEANING:
- Remove item codes/SKUs (e.g., "#1234 BURGER" → "Burger")
- Capitalize properly (e.g., "CHICKEN WINGS" → "Chicken Wings")
- Keep modifiers (e.g., "LG FRIES" → "Large Fries")
- Keep combo names (e.g., "#5 COMBO" → "#5 Combo")

## FEW-SHOT EXAMPLES

### Example 1: Basic receipt
Receipt shows:
  CHICKEN BURRITO     $8.79
  LARGE DRINK         $2.19
  TAX                 $0.88
  TOTAL              $11.86

Output:
{"items":[{"name":"Chicken Burrito","price":8.79,"quantity":1},{"name":"Large Drink","price":2.19,"quantity":1}],"restaurant":null,"date":null}

### Example 2: With quantities
Receipt shows:
  3 BIL-CHANTI       114.00
  1 KETLE ONE         10.00
  2 ANTIPASTO         40.00
  SUBTOTAL           164.00

Output:
{"items":[{"name":"Btl Chianti","price":114.00,"quantity":3},{"name":"Kettle One","price":10.00,"quantity":1},{"name":"Antipasto","price":40.00,"quantity":2}],"restaurant":null,"date":null}

### Example 3: Modifiers and add-ons
Receipt shows:
  MARGHERITA PIZZA   $14.99
    ADD PEPPERONI     $2.00
    ADD MUSHROOMS     $1.50
  GARLIC BREAD        $4.99

Output:
{"items":[{"name":"Margherita Pizza","price":14.99,"quantity":1},{"name":"Add Pepperoni","price":2.00,"quantity":1},{"name":"Add Mushrooms","price":1.50,"quantity":1},{"name":"Garlic Bread","price":4.99,"quantity":1}],"restaurant":null,"date":null}

### Example 4: Combo meals
Receipt shows:
  #3 BIG MAC MEAL     $9.99
  6PC NUGGETS         $4.49
  APPLE PIE x2        $2.00

Output:
{"items":[{"name":"#3 Big Mac Meal","price":9.99,"quantity":1},{"name":"6pc Nuggets","price":4.49,"quantity":1},{"name":"Apple Pie","price":2.00,"quantity":2}],"restaurant":null,"date":null}

### Example 5: Happy hour / discounts (ignore discount lines)
Receipt shows:
  BEER                $6.00
  HAPPY HOUR         -$2.00
  WINGS              $12.00
  TOTAL              $16.00

Output:
{"items":[{"name":"Beer","price":6.00,"quantity":1},{"name":"Wings","price":12.00,"quantity":1}],"restaurant":null,"date":null}

### Example 6: Weight-based items
Receipt shows:
  SALMON 0.75LB      $11.25
  RIBEYE 1.2LB       $23.40

Output:
{"items":[{"name":"Salmon 0.75lb","price":11.25,"quantity":1},{"name":"Ribeye 1.2lb","price":23.40,"quantity":1}],"restaurant":null,"date":null}

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown. No explanation. No code blocks.

{
  "items": [
    {"name": "Item Name", "price": 0.00, "quantity": 1}
  ],
  "restaurant": "Name if visible, otherwise null",
  "date": "Date if visible in any format, otherwise null",
  "currency": "EUR|USD|GBP|JPY|CHF|CAD|AUD based on symbols or context, default EUR if unclear"
}

If you cannot find ANY items: {"items":[],"error":"No menu items found - image may be unclear or not a receipt","currency":"EUR"}`;

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

    // Call GPT-4o Vision with optimized settings
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a precise receipt parser. Output only valid JSON. Never include markdown formatting or explanations.",
        },
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
                detail: "high", // High detail for better text recognition
              },
            },
          ],
        },
      ],
      max_tokens: 4000, // Increased for long receipts
      temperature: 0, // Zero temperature for maximum consistency
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
    } catch {
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
