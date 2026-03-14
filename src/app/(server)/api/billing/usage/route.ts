import { NextResponse } from "next/server";

export const GET = async () => {
  const usage = {
    patients: 120,
    video_call_hours: 15,
    ai_usage: 3000,
  };

  return NextResponse.json(usage);
};
