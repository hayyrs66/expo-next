import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns-tz";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    const { userId, date } = await req.json();

    if (!userId || !date) {
      return NextResponse.json({ error: "Missing userId or date." }, { status: 400 });
    }

    // Convert the provided date to Guatemala timezone
    const guatemalaDate = format(new Date(date), "yyyy-MM-dd", { timeZone: "America/Guatemala" });

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

    if (callRecord && callRecord.call_count > 0) {
      // Decrease the call count
      const { error: updateError } = await supabase
        .from("calls")
        .update({ call_count: callRecord.call_count - 1 })
        .eq("id", callRecord.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update call count." }, { status: 500 });
      }

      return NextResponse.json({ message: "Call removed successfully." });
    } else {
      return NextResponse.json({ error: "No calls to remove." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in removecall:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
