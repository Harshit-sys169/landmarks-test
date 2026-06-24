import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { registerForPushNotificationsAsync } from "../../lib/push-notifications";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const segment = segments[0];
      const inAuthGroup = segment === "(auth)";
      const inOnboarding = segment === "onboarding";

      if (!session && !inAuthGroup && !inOnboarding) {
        router.replace("/onboarding");
      }

      if (session && (inAuthGroup || inOnboarding)) {
        router.replace("/(tabs)");
      }

      setLoading(false);
    };

    void checkSession();
  }, [router, segments]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="park-summary"
        options={{
          presentation: "modal",
          gestureEnabled: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}