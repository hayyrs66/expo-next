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

    if (!userId) {
      return NextResponse.json(
        { error: "Falta el parámetro 'userId'." },
        { status: 400 }
      );
    }

    // Filtrar llamadas por user_id
    const { data, error } = await supabase
      .from("calls")
      .select("call_count")
      .eq("user_id", userId);

    if (error) {
      console.error("Error al obtener las llamadas:", error);
      return NextResponse.json(
        { error: "Error al obtener las llamadas." },
        { status: 500 }
      );
    }

    // Sumar todas las llamadas asociadas al user_id
    const totalCalls = data.reduce((sum, record) => sum + record.call_count, 0);

    return NextResponse.json({ totalCalls });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
