import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import FeedCard from "../../../components/feed/FeedCard";
import { Typography } from "../../../components/ui/typography";
import { FeedPost, ProfileRow } from "../../../lib/post-types";
import { supabase } from "../../../lib/supabase";

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const { data: postRows, error: postsError } = await supabase
        .from("posts")
        .select("id, author_id, image_storage_id, park_name, caption, latitude, longitude, created_at")
        .order("created_at", { ascending: false });

      if (postsError) {
        Alert.alert("Feed error", postsError.message);
        return;
      }

      const authorIds = Array.from(
        new Set((postRows ?? []).map((post) => post.author_id))
      );

      let profiles: ProfileRow[] = [];

      if (authorIds.length > 0) {
        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_storage_id")
          .in("id", authorIds);

        if (profilesError) {
          Alert.alert("Profile error", profilesError.message);
          return;
        }

        profiles = profileRows ?? [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      const feedItems: FeedPost[] = (postRows ?? []).map((post) => {
        const profile = profileMap.get(post.author_id) ?? null;

        const imageUrl = supabase.storage
          .from("post-images")
          .getPublicUrl(post.image_storage_id).data.publicUrl;

        const avatarUrl = profile?.avatar_storage_id
          ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_id).data.publicUrl
          : null;

        return {
          ...post,
          profile,
          imageUrl,
          avatarUrl,
        };
      });

      setPosts(feedItems);
    } catch (error: any) {
      Alert.alert("Feed error", error?.message ?? String(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadFeed();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="h1">Feed</Typography>
        <Typography variant="body">Loading posts...</Typography>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Typography variant="h1">Feed</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Discover landmarks, save inspiration, and explore new places.
          </Typography>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Typography variant="h3">No posts yet</Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create a post to see it appear here.
          </Typography>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <FeedCard
          post={item}
          onPress={() => router.push(`/post/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  subtitle: {
    color: "#64748B",
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
  },
  separator: {
    height: 16,
  },
});