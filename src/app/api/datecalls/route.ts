import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const userId = searchParams.get("userId");

    if (!dateParam || !userId) {
      return NextResponse.json(
        { error: "Fecha o userId no proporcionados." },
        { status: 400 }
      );
    }

    const formattedDate = new Date(dateParam).toISOString().split("T")[0];

    console.log("Formatted date:", formattedDate);

    const { data, error } = await supabase
      .from("calls")
      .select("call_count")
      .eq("call_date", formattedDate)
      .eq("user_id", userId);

    if (error) {
      console.error("Error al obtener las llamadas:", error);
      return NextResponse.json(
        { error: "Error al obtener las llamadas." },
        { status: 500 }
      );
    }

    console.log("Supabase response data:", data);

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