import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { ensureProfile } from "../../lib/profile";
import { getParkCoordinates } from "../../lib/park-coordinates";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Typography } from "../../components/ui/typography";
import { supabase } from "../../lib/supabase";

type PickerSource = "camera" | "library";

export default function CreatePostScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parkName, setParkName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source: PickerSource) => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        source === "camera"
          ? "Please allow camera access."
          : "Please allow photo access."
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
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

    const coordinates = getParkCoordinates(parkName.trim());

    if (!coordinates) {
      Alert.alert(
        "Unknown park",
        "Use a real park name such as Yellowstone National Park, Yosemite National Park, Grand Canyon National Park, or Badlands National Park."
      );
      return;
    }

    try {
      setUploading(true);

      const profileId = await ensureProfile();
      if (!profileId) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const filePath = `${profileId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, decode(base64), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Upload failed", uploadError.message);
        return;
      }

      const { data: createdPost, error: insertError } = await supabase
        .from("posts")
        .insert({
          author_id: profileId,
          image_storage_id: filePath,
          caption: caption.trim() || null,
          park_name: parkName.trim(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        })
        .select("id")
        .single();

      if (insertError) {
        Alert.alert("Database Error", insertError.message);
        return;
      }

      Alert.alert("Success", "Post created");

      setImageUri(null);
      setParkName("");
      setCaption("");

      if (createdPost?.id) {
        router.replace(`/post/${createdPost.id}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? String(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="h1">Create Post</Typography>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <Typography variant="body">No image selected</Typography>
      )}

      <Button title="Take Photo" onPress={() => pickImage("camera")} />
      <Button
        title="Choose From Library"
        variant="secondary"
        onPress={() => pickImage("library")}
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