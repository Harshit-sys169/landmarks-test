import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { Typography } from "../ui/typography";

type PostCardProps = {
  imageUrl: string;
  parkName: string;
  caption?: string | null;
  onDelete?: () => void;
  deleting?: boolean;
};

export default function PostCard({
  imageUrl,
  parkName,
  caption,
  onDelete,
  deleting = false,
}: PostCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Typography variant="h3" style={styles.title}>
            {parkName}
          </Typography>

          {onDelete ? (
            <Pressable
              onPress={onDelete}
              disabled={deleting}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
            >
              <Feather name="trash-2" size={18} color="#DC2626" />
            </Pressable>
          ) : null}
        </View>

        {caption ? (
          <Typography variant="body" style={styles.caption}>
            {caption}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  image: {
    width: "100%",
    height: 240,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
  },
  caption: {
    color: "#475569",
    lineHeight: 22,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
});