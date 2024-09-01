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
  console.log("POST request received");
  const body = await req.json();
  const { destinations, days, preferences, travelerType } = body;
  console.log("Request body:", { destinations, days, preferences, travelerType });

  if (
    !destinations ||
    (Array.isArray(destinations) && destinations.length === 0)
  ) {
    console.log("Missing destinations, returning 400");
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
  console.log("Generated prompt:", prompt);

  try {
    console.log("Calling OpenAI API");
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
    console.log("OpenAI API call completed");

    const itineraryResponse = completion.choices[0].message.content;
    console.log("Raw OpenAI response:", itineraryResponse);

    let parsedItinerary;

    try {
      console.log("Attempting to parse itinerary JSON");
      const cleanedResponse = itineraryResponse
        ?.replace(/```json\n?|\n?```/g, "")
        .trim() ?? "";
      console.log("Cleaned response:", cleanedResponse);
      const jsonArray =
        cleanedResponse.startsWith("[") && cleanedResponse.endsWith("]")
          ? cleanedResponse
          : `[${cleanedResponse}]`;
      console.log("JSON array to parse:", jsonArray);
      parsedItinerary = JSON.parse(jsonArray);
      console.log("Successfully parsed itinerary JSON");
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

    console.log("Saving itinerary to Supabase");
    const { data: savedItinerary, error: saveError } = await supabaseAdmin
      .from('itineraries')
      .insert({
        destinations,
        num_days: parseInt(days),
        preferences,
        traveler_type: travelerType,
        days: parsedItinerary
      })
      .select();

    if (saveError) {
      console.error("Error saving to Supabase:", saveError);
      return NextResponse.json({ 
        itinerary: parsedItinerary,
        saveError: "Failed to save itinerary to database"
      });
    }
    console.log("Itinerary saved successfully");

    const response = NextResponse.json({ itinerary: parsedItinerary });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error : any) {
    const errorResponse = NextResponse.json(
      { error: "Failed to generate itinerary", details: error.message },
      { status: 500 }
    );
    
    // Add cache control headers to error response as well
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return errorResponse;
  }
}
