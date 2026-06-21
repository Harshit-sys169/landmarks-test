import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

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
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        .single<ProfileRow>();

      if (error) {
        Alert.alert("Error", error.message);
        setLoading(false);
        return;
      }

      setDisplayName(data.display_name ?? "");
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
      setAvatarStorageId(data.avatar_storage_id ?? null);

      if (data.avatar_storage_id) {
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.avatar_storage_id);

        setAvatarUrl(publicData.publicUrl);
      } else {
        setAvatarUrl(null);
      }

      setLoading(false);
    };

    void loadProfile();
  }, []);

  const pickAvatar = async () => {
    if (!profileId) {
      Alert.alert(
        "Missing profile id",
        "Set EXPO_PUBLIC_PROFILE_ID in .env.local",
      );
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo library access to choose an avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) return;

    try {
      setUploadingAvatar(true);

      const extension =
        asset.uri.split(".").pop()?.split("?")[0] ?? "jpg";

      const filePath = `${profileId}/${Date.now()}.${extension}`;

      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64), {
          contentType: asset.mimeType ?? "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Upload failed", uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarStorageId(filePath);
      setAvatarUrl(data.publicUrl);
      Alert.alert("Success", "Avatar updated successfully.");
    } catch (error: any) {
      Alert.alert("Avatar error", error?.message ?? String(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        avatar_storage_id: avatarStorageId,
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

      <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Typography variant="body">
              {uploadingAvatar ? "Uploading..." : "Tap to add avatar"}
            </Typography>
          </View>
        )}
      </Pressable>

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
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    padding: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  spacer: {
    height: 8,
  },
});