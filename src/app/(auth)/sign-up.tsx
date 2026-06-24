import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Typography } from "../../../components/ui/typography";
import { supabase } from "../../../lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!firstName.trim() || !email.trim() || !password) {
      Alert.alert("Missing details", "Enter first name, email, and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    const userId = data.user?.id;

    const { error: loopError } = await supabase.functions.invoke(
      "create-loops-contact",
      {
        body: {
          email: email.trim(),
          firstName: firstName.trim(),
          userId,
        },
      }
    );

    if (loopError) {
      Alert.alert("Loops error", loopError.message);
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Typography variant="h1">Sign Up</Typography>

      <Input
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? "Creating account..." : "Create Account"}
        onPress={signUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
});