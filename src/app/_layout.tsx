import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { supabase } from "../../lib/supabase";
import { ensureProfile } from "../../lib/profile";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const inAuthGroup = segments[0] === "(auth)";

      if (!session && !inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }

      if (session && inAuthGroup) {
        await ensureProfile();
        router.replace("/(tabs)");
      }

      setLoading(false);
    };

    void checkSession();
  }, [router, segments]);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}