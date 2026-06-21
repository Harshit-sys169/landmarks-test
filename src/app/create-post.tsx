import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { ensureProfile } from "../../lib/profile";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Typography } from "../../components/ui/typography";
import { supabase } from "../../lib/supabase";

export default function CreatePostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parkName, setParkName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const selectImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow photo access.");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (result.canceled) return;

    setImageUri(result.assets[0].uri);
  };

  const createPost = async () => {
    if (!imageUri) {
      Alert.alert("Please select an image");
      return;
    }

    if (!parkName.trim()) {
      Alert.alert("Please enter a landmark name");
      return;
    }

    try {
      setUploading(true);

      const profileId = await ensureProfile();
      if (!profileId) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(
        imageUri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      const filePath = `${profileId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(
          filePath,
          decode(base64),
          {
            contentType: "image/jpeg",
            upsert: true,
          }
        );

      if (uploadError) {
        Alert.alert("Upload failed", uploadError.message);
        return;
      }

      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          author_id: profileId,
          image_storage_id: filePath,
          caption: caption.trim() || null,
          park_name: parkName.trim(),
        });

      if (insertError) {
        Alert.alert("Database Error", insertError.message);
        return;
      }

      Alert.alert("Success", "Post created");

      setImageUri(null);
      setParkName("");
      setCaption("");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? String(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="h1">
        Create Post
      </Typography>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
        />
      ) : (
        <Typography variant="body">
          No image selected
        </Typography>
      )}

      <Button
        title="Select Image"
        onPress={selectImage}
      />

      <Input
        value={parkName}
        onChangeText={setParkName}
        placeholder="Landmark name"
      />

      <Input
        value={caption}
        onChangeText={setCaption}
        placeholder="Caption"
      />

      <Button
        title={uploading ? "Creating..." : "Create Post"}
        onPress={createPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },

  preview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
});