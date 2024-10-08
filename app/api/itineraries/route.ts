import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const fetchCache = 'force-no-store';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 5;

    // Fetch total count
    const { count } = await supabaseAdmin
      .from('itineraries')
      .select('*', { count: 'exact', head: true });

    // Fetch paginated data
    const { data, error } = await supabaseAdmin
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      itineraries: data,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { error: "Failed to fetch itineraries" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseAdmin
      .from('itineraries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json(
      { error: "Failed to delete itinerary" },
      { status: 500 }
    );
  }
}