import { supabase } from "./supabase";

export type ParkAISummary = {
  parkName: string;
  summary: string;
  bestTimeToVisit: string;
};

export async function fetchParkAISummary(
  parkName: string
): Promise<ParkAISummary> {
  const { data, error } = await supabase.functions.invoke("park-ai-summary", {
    body: { parkName },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No response returned from the AI summary function.");
  }

  return data as ParkAISummary;
}