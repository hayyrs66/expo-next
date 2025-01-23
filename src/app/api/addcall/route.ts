import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    const { userId, date } = await req.json();

    if (!userId || !date) {
      return NextResponse.json({ error: "Missing userId or date." }, { status: 400 });
    }

    // Convert the provided date to Guatemala timezone
    const guatemalaDate = new Date(date).toLocaleDateString("en-CA", { timeZone: "America/Guatemala" });

    // Check if there is already a record for the user and date
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
      // Update the call count
      const { error: updateError } = await supabase
        .from("calls")
        .update({ call_count: callRecord.call_count + 1 })
        .eq("id", callRecord.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update call count." }, { status: 500 });
      }
    } else {
      // Insert a new call record
      const { error: insertError } = await supabase.from("calls").insert({
        user_id: userId,
        call_date: guatemalaDate,
        call_count: 1,
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
