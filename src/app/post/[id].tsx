import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Typography } from "../../../components/ui/typography";
import { PostRow, ProfileRow } from "../../../lib/post-types";
import { supabase } from "../../../lib/supabase";

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type CommentWithProfile = CommentRow & {
  profile: ProfileRow | null;
  avatarUrl: string | null;
};

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<PostRow | null>(null);
  const [author, setAuthor] = useState<ProfileRow | null>(null);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const loadPost = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(
          "id, author_id, image_storage_id, park_name, caption, latitude, longitude, created_at"
        )
        .eq("id", postId)
        .single<PostRow>();

      if (postError) {
        Alert.alert("Post error", postError.message);
        setLoading(false);
        return;
      }

      setPost(postData ?? null);

      if (postData?.author_id) {
        const { data: authorData } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_storage_id")
          .eq("id", postData.author_id)
          .maybeSingle<ProfileRow>();

        setAuthor(authorData ?? null);
      }

      const { data: commentRows, error: commentsError } = await supabase
        .from("comments")
        .select("id, post_id, author_id, body, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        Alert.alert("Comments error", commentsError.message);
        setLoading(false);
        return;
      }

      const commentAuthors = Array.from(
        new Set((commentRows ?? []).map((comment) => comment.author_id))
      );

      let profileRows: ProfileRow[] = [];

      if (commentAuthors.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_storage_id")
          .in("id", commentAuthors);

        if (profilesError) {
          Alert.alert("Profile error", profilesError.message);
          setLoading(false);
          return;
        }

        profileRows = profilesData ?? [];
      }

      const profileMap = new Map(
        profileRows.map((profile) => [profile.id, profile])
      );

      const mappedComments: CommentWithProfile[] = (commentRows ?? []).map(
        (comment) => {
          const profile = profileMap.get(comment.author_id) ?? null;
          const avatarUrl = profile?.avatar_storage_id
            ? supabase.storage
                .from("avatars")
                .getPublicUrl(profile.avatar_storage_id).data.publicUrl
            : null;

          return {
            ...comment,
            profile,
            avatarUrl,
          };
        }
      );

      setComments(mappedComments);
    } catch (error: any) {
      Alert.alert("Post error", error?.message ?? String(error));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const addComment = async () => {
    if (!post) return;

    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      setSavingComment(true);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        author_id: user.id,
        body: trimmed,
      });

      if (error) {
        Alert.alert("Comment failed", error.message);
        return;
      }

      setCommentText("");
      await loadPost();
    } catch (error: any) {
      Alert.alert("Comment failed", error?.message ?? String(error));
    } finally {
      setSavingComment(false);
    }
  };

  const openParkSummary = () => {
    if (!post) return;

    router.push({
      pathname: "/park-summary",
      params: {
        parkName: post.park_name,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Typography variant="h1">Post</Typography>
          <Typography variant="body">Loading post...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Typography variant="h1">Post</Typography>
          <Typography variant="body">No post found.</Typography>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const authorName = author?.display_name ?? "Unknown user";
  const username = author?.username ?? "@unknown";
  const avatarUrl = author?.avatar_storage_id
    ? supabase.storage
        .from("avatars")
        .getPublicUrl(author.avatar_storage_id).data.publicUrl
    : null;

  const imageUrl = supabase.storage
    .from("post-images")
    .getPublicUrl(post.image_storage_id).data.publicUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={18} color="#0F172A" />
            </Pressable>

            <Typography variant="h1">Post</Typography>

            <View style={styles.spacer} />
          </View>

          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Typography variant="body" style={styles.avatarText}>
                  {authorName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Typography>
              )}
            </View>

            <View style={styles.authorMeta}>
              <Typography variant="h3" style={styles.authorName}>
                {authorName}
              </Typography>
              <Typography variant="body" style={styles.username}>
                {username}
              </Typography>
            </View>
          </View>

          <View style={styles.imageWrap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
            />

            <Pressable onPress={openParkSummary} style={styles.aiButton}>
              <Feather name="cpu" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.details}>
            <Typography variant="h2">{post.park_name}</Typography>

            {post.caption ? (
              <Typography variant="body" style={styles.caption}>
                {post.caption}
              </Typography>
            ) : null}
          </View>

          <View style={styles.commentsSection}>
            <Typography variant="h2">Comments</Typography>

            {comments.length === 0 ? (
              <Typography variant="body" style={styles.noComments}>
                No comments yet. Be the first to add one.
              </Typography>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      {comment.avatarUrl ? (
                        <Image
                          source={{ uri: comment.avatarUrl }}
                          style={styles.commentAvatarImage}
                        />
                      ) : (
                        <Typography variant="body" style={styles.commentAvatarText}>
                          {(
                            comment.profile?.display_name ?? "User"
                          )
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </Typography>
                      )}
                    </View>

                    <View style={styles.commentMeta}>
                      <Typography variant="body" style={styles.commentName}>
                        {comment.profile?.display_name ?? "Unknown user"}
                      </Typography>
                      <Typography variant="body" style={styles.commentUsername}>
                        {comment.profile?.username ?? "@unknown"}
                      </Typography>
                    </View>
                  </View>

                  <Typography variant="body" style={styles.commentBody}>
                    {comment.body}
                  </Typography>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.composer}>
          <Input
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment"
            multiline
            numberOfLines={3}
            style={styles.commentInput}
          />

          <Button
            title={savingComment ? "Posting..." : "Post Comment"}
            onPress={addComment}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  spacer: {
    width: 44,
    height: 44,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  authorMeta: {
    gap: 2,
  },
  authorName: {
    fontSize: 16,
  },
  username: {
    color: "#64748B",
    fontSize: 13,
  },
  imageWrap: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 420,
    backgroundColor: "#E2E8F0",
  },
  aiButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 6,
  },
  details: {
    gap: 10,
  },
  caption: {
    color: "#475569",
    lineHeight: 22,
  },
  commentsSection: {
    gap: 12,
  },
  noComments: {
    color: "#64748B",
  },
  commentCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 14,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  commentMeta: {
    gap: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentUsername: {
    fontSize: 12,
    color: "#64748B",
  },
  commentBody: {
    color: "#334155",
    lineHeight: 21,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  commentInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});