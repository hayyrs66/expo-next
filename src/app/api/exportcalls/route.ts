// /api/exportcalls/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabase
      .from('calls')
      .select(`
        call_date,
        user_id,
        reason,
        number,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('call_date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en exportación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al exportar datos' },
      { status: 500 }
    );
  }
}
