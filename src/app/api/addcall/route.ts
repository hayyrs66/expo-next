import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { format } from "date-fns";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req: Request) {
  try {
    let userId, date, reason, number;
    
    try {
      ({ userId, date, reason, number } = await req.json());
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
    }

    const fullNumberRegex = /^\+502\d{8}$/;
    if (!fullNumberRegex.test(number)) {
      return NextResponse.json({ error: "Número inválido" }, { status: 400 });
    }

    const { error } = await supabase.from("calls").insert({
      user_id: userId,
      call_date: new Date(date).toISOString(),
      reason: reason,
      number: number
    });

    if (error) {
      return NextResponse.json({ error: "Error al crear registro" }, { status: 500 });
    }

    return NextResponse.json({ message: "Registro creado exitosamente" });

  } catch (error) {
    console.error("Error in addcall:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}