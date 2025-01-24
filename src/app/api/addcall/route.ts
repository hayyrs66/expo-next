import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { format } from "date-fns";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req: Request) {
  try {
    let userId, date, reason;
    try {
      ({ userId, date, reason } = await req.json());
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
    }

    if (!userId || !date || !reason) {
      return NextResponse.json({ error: "Missing userId or date." }, { status: 400 });
    }

    const guatemalaDate = new Date(date).toLocaleDateString("en-CA", { timeZone: "America/Guatemala" });

    const { data: callRecord, error } = await supabase
      .from("calls")
      .select("*")
      .eq("user_id", userId)
      .eq("call_date", guatemalaDate)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Error fetching call record." }, { status: 500 });
    }

    if (callRecord) {
      const { error: updateError } = await supabase
        .from("calls")
        .update({ call_count: callRecord.call_count + 1 })
        .eq("id", callRecord.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update call count." }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from("calls").insert({
        user_id: userId,
        call_date: guatemalaDate,
        call_count: 1,
        reason: reason,
      });

      if (insertError) {
        return NextResponse.json({ error: "Failed to create call record." }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Call added successfully." });
  } catch (error) {
    console.error("Error in addcall:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
