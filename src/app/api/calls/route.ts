import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const global = searchParams.get("global");

    let query = supabase
      .from("calls")
      .select("*", { count: "exact", head: true });

    if (userId && !global) {
      query = query.eq("user_id", userId);
    }

    if (date) {
      query = query.eq("call_date", date);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error al obtener las llamadas:", error);
      return NextResponse.json(
        { error: "Error al obtener las llamadas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ totalCalls: count || 0 });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
