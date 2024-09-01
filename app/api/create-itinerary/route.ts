import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { destinations, days, preferences, travelerType } = body;

  if (
    !destinations ||
    (Array.isArray(destinations) && destinations.length === 0)
  ) {
    return NextResponse.json(
      { error: "Missing destinations" },
      { status: 400 }
    );
  }

  const prompt = `Create a ${days}-day itinerary for a ${travelerType} traveler visiting ${destinations.join(", ")}. 
    Preferences: ${Object.entries(preferences)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ")}. 
    Provide detailed daily activities and recommendations.`;

  try {
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

    const itineraryResponse = completion.choices[0].message.content;
    console.log("Raw OpenAI response:", itineraryResponse);

    let parsedItinerary;

    try {
      // Remove any potential markdown code block formatting and ensure it starts and ends with square brackets
      const cleanedResponse = itineraryResponse
        ?.replace(/```json\n?|\n?```/g, "")
        .trim() ?? "";
      const jsonArray =
        cleanedResponse.startsWith("[") && cleanedResponse.endsWith("]")
          ? cleanedResponse
          : `[${cleanedResponse}]`;
      parsedItinerary = JSON.parse(jsonArray);
    } catch (parseError) {
      console.error("Failed to parse itinerary JSON:", parseError);
      return NextResponse.json(
        {
          error: "Failed to generate valid itinerary",
          rawResponse: itineraryResponse,
        },
        { status: 500 }
      );
    }

    // After successfully parsing the itinerary, save it to Supabase
    const { data: savedItinerary, error: saveError } = await supabaseAdmin
      .from('itineraries')
      .insert({
        destinations,
        num_days: parseInt(days),
        preferences,
        traveler_type: travelerType,
        days: parsedItinerary
        // Remove the user_id field
      })
      .select()

    if (saveError) {
      console.error("Error saving to Supabase:", saveError);
      // Return the error along with the generated itinerary
      return NextResponse.json({ 
        itinerary: parsedItinerary,
        saveError: "Failed to save itinerary to database"
      });
    }

    return NextResponse.json({ itinerary: parsedItinerary });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
