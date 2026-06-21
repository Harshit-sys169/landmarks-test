import { supabase } from "./supabase";

export async function ensureProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const user = userData.user;

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return user.id;
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "User";

  const username =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : null;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
    username,
    bio: null,
    avatar_storage_id: null,
  });

  if (insertError) {
    throw insertError;
  }

  return user.id;
}