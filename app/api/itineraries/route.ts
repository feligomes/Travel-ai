import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const fetchCache = 'force-no-store';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ itineraries: data });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { error: "Failed to fetch itineraries" },
      { status: 500 }
    );
  }
}