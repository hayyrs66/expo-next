import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // Obtener la fecha del parámetro

    if (!date) {
      return NextResponse.json(
        { error: "Falta el parámetro 'date'." },
        { status: 400 }
      );
    }

    // Consultar todas las llamadas realizadas en la fecha seleccionada
    const { data, error } = await supabase
      .from("calls")
      .select("call_count")
      .eq("call_date", date);

    if (error) {
      console.error("Error al obtener las llamadas:", error);
      return NextResponse.json(
        { error: "Error al obtener las llamadas." },
        { status: 500 }
      );
    }

    // Calcular el total de llamadas realizadas en la fecha seleccionada
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
