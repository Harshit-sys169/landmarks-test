import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Typography } from "../../../components/ui/typography";

export default function SettingsScreen() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.title}>
        Settings
      </Typography>

      <Typography variant="body" style={styles.label}>
        Display name
      </Typography>
      <Input
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter display name"
      />

      <Typography variant="body" style={styles.label}>
        Bio
      </Typography>
      <Input
        value={bio}
        onChangeText={setBio}
        placeholder="Enter bio"
      />

      <Button title="Save changes" onPress={() => {}} />

      <View style={styles.spacer} />

      <Button title="Sign out" variant="secondary" onPress={() => {}} />
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
  title: {
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  spacer: {
    height: 8,
  },
});