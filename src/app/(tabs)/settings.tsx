import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Typography } from "../../../components/ui/typography";
import { supabase } from "../../../lib/supabase";

const profileId = process.env.EXPO_PUBLIC_PROFILE_ID;

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string;
  bio: string | null;
  avatar_storage_id: string | null;
};

export default function SettingsScreen() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        Alert.alert(
          "Missing profile id",
          "Set EXPO_PUBLIC_PROFILE_ID in .env.local",
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_storage_id")
        .eq("id", profileId)
        .single();

      if (error) {
        Alert.alert("Error", error.message);
        setLoading(false);
        return;
      }

      const profile = data as ProfileRow;

      setDisplayName(profile.display_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");

      if (profile.avatar_storage_id) {
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(profile.avatar_storage_id);

        setAvatarUrl(publicData.publicUrl);
      } else {
        setAvatarUrl(null);
      }

      setLoading(false);
    };

    void loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!profileId) {
      Alert.alert(
        "Missing profile id",
        "Set EXPO_PUBLIC_PROFILE_ID in .env.local",
      );
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Missing display name", "Display name cannot be empty.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        username: username.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    setSaving(false);

    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }

    Alert.alert("Saved", "Profile updated successfully.");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Sign out failed", error.message);
      return;
    }

    Alert.alert("Signed out", "You have been signed out.");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Typography variant="h1">Settings</Typography>
        <Typography variant="body">Loading profile...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.title}>
        Settings
      </Typography>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Typography variant="body">No avatar</Typography>
        </View>
      )}

      <Typography variant="body" style={styles.label}>
        Display name
      </Typography>
      <Input
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter display name"
      />

      <Typography variant="body" style={styles.label}>
        Username
      </Typography>
      <Input
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

      <Typography variant="body" style={styles.label}>
        Bio
      </Typography>
      <Input
        value={bio}
        onChangeText={setBio}
        placeholder="Enter bio"
        multiline
        numberOfLines={4}
        style={styles.bioInput}
      />

      <Button
        title={saving ? "Saving..." : "Save changes"}
        onPress={saveProfile}
      />

      <View style={styles.spacer} />

      <Button title="Sign out" variant="secondary" onPress={handleSignOut} />
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
    textAlign: "center",
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    alignSelf: "center",
    marginBottom: 12,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  spacer: {
    height: 8,
  },
});