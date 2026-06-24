import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";

import PostCard from "../../../components/posts/post-card";
import { Button } from "../../../components/ui/button";
import { Typography } from "../../../components/ui/typography";
import { supabase } from "../../../lib/supabase";

type PostRow = {
  id: string;
  author_id: string;
  image_storage_id: string;
  park_name: string;
  caption: string | null;
  created_at: string;
};

export default function MyPostsScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        Alert.alert("Not signed in", "Please sign in again.");
        setPosts([]);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, author_id, image_storage_id, park_name, caption, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setPosts(data ?? []);
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? String(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadPosts();
  };

  const deletePost = async (post: PostRow) => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    Alert.alert("Delete post", "This will delete the post from your feed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(post.id);

            const { error } = await supabase
              .from("posts")
              .delete()
              .eq("id", post.id)
              .eq("author_id", user.id);

            if (error) {
              Alert.alert("Delete failed", error.message);
              return;
            }

            setPosts((current) =>
              current.filter((item) => item.id !== post.id),
            );
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Typography variant="h1">My Posts</Typography>
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
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Typography variant="h1">My Posts</Typography>
          <Typography variant="body">
            Review and manage the posts you created.
          </Typography>
          <Button
            title="Create Post"
            onPress={() => router.push("/create-post")}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Typography variant="h3">No posts yet</Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create your first landmark post to see it here.
          </Typography>
          <Button
            title="Create Post"
            onPress={() => router.push("/create-post")}
          />
        </View>
      }
      renderItem={({ item }) => {
        const imageUrl = supabase.storage
          .from("post-images")
          .getPublicUrl(item.image_storage_id).data.publicUrl;

        return (
          <PostCard
            imageUrl={imageUrl}
            parkName={item.park_name}
            caption={item.caption}
            onDelete={() => deletePost(item)}
            deleting={deletingId === item.id}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 12,
    marginBottom: 8,
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
});