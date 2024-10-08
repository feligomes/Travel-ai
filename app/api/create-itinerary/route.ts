import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Add this line at the top of the file
export const fetchCache = 'force-no-store';

// Initialize OpenAI and Supabase clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Utility function to generate the OpenAI prompt
const generatePrompt = (days: number, travelerType: string, destinations: string[], preferences: Record<string, boolean>) => {
  const formattedPreferences = Object.entries(preferences)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(", ");

  return `Create a ${days}-day itinerary for a ${travelerType} traveler visiting ${destinations.join(", ")}. 
  Preferences: ${formattedPreferences}. 
  Provide detailed daily activities and recommendations.`;
};

// Function to handle the OpenAI API call
const getItineraryFromOpenAI = async (prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert travel planner, creating exciting and efficient itineraries. Provide your response as a JSON array of day objects, without any wrapper object. Each day object should have the structure: {day: number, location: 'City, Country', activities: [{time: 'string', description: 'string'}]}. Do not include any markdown formatting or code blocks.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 4000,
    temperature: 0.7,
    top_p: 0.9,
  });

  return completion.choices[0].message.content;
};

// Update the saveItineraryToSupabase function
const saveItineraryToSupabase = async (destinations: string[], days: number, preferences: Record<string, boolean>, travelerType: string, itinerary: any) => {
  const { data, error } = await supabaseAdmin
    .from("itineraries")
    .insert({
      destinations,
      num_days: days,
      preferences,
      traveler_type: travelerType,
      days: itinerary,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Main handler function
export async function POST(req: NextRequest) {
  try {
    const timestamp = Date.now();
    const { destinations, days, preferences, travelerType } = await req.json();

    if (!destinations || destinations.length === 0) {
      return NextResponse.json({ error: "Missing destinations" }, { status: 400 });
    }

    const prompt = generatePrompt(days, travelerType, destinations, preferences);
    const rawResponse = await getItineraryFromOpenAI(prompt);

    let parsedItinerary;
    try {
      parsedItinerary = JSON.parse(rawResponse || "{}");
    } catch (error) {
      console.error("Error parsing itinerary JSON:", error);
      return NextResponse.json({ error: "Failed to generate valid itinerary", rawResponse }, { status: 500 });
    }

    const savedItinerary = await saveItineraryToSupabase(destinations, parseInt(days), preferences, travelerType, parsedItinerary);

    if (!savedItinerary) {
      return NextResponse.json({ error: "Failed to save itinerary to database" }, { status: 500 });
    }

    return NextResponse.json({ 
      itinerary: parsedItinerary, 
      id: savedItinerary.id,
      timestamp 
    });
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return NextResponse.json({ error: "Failed to generate itinerary", details: error.message }, { status: 500 });
  }
}
