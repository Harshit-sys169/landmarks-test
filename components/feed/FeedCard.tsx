import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { FeedPost } from "../../lib/post-types";
import { Typography } from "../ui/typography";

type FeedCardProps = {
  post: FeedPost;
  onPress: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FeedCard({ post, onPress }: FeedCardProps) {
  const displayName = post.profile?.display_name ?? "Unknown user";
  const username = post.profile?.username ?? "@unknown";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.avatarUrl ? (
            <Image source={{ uri: post.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Typography variant="body" style={styles.avatarText}>
              {getInitials(displayName)}
            </Typography>
          )}
        </View>

        <View style={styles.userMeta}>
          <Typography variant="h3" style={styles.name}>
            {displayName}
          </Typography>
          <Typography variant="body" style={styles.username}>
            {username}
          </Typography>
        </View>

        <Feather name="chevron-right" size={18} color="#64748B" />
      </View>

      <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" />

      <View style={styles.body}>
        <Typography variant="h3" style={styles.parkName}>
          {post.parkName}
        </Typography>

        {post.caption ? (
          <Typography variant="body" style={styles.caption}>
            {post.caption}
          </Typography>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="heart" size={16} color="#EF4444" />
            <Typography variant="body" style={styles.statText}>
              0
            </Typography>
          </View>

          <View style={styles.statItem}>
            <Feather name="message-circle" size={16} color="#2563EB" />
            <Typography variant="body" style={styles.statText}>
              0
            </Typography>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  userMeta: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
  },
  username: {
    color: "#64748B",
    fontSize: 13,
  },
  image: {
    width: "100%",
    height: 320,
    backgroundColor: "#E2E8F0",
  },
  body: {
    padding: 16,
    gap: 10,
  },
  parkName: {
    fontSize: 18,
  },
  caption: {
    color: "#475569",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "#475569",
    fontSize: 13,
  },
});