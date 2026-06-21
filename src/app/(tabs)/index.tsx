import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { Typography } from "../../../components/ui/typography";
import { supabase } from "../../../lib/supabase";

type Post = {
  id: string;
  park_name: string;
  caption: string | null;
  image_storage_id: string;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setPosts(data ?? []);
  };

  const renderItem = ({ item }: { item: Post }) => {
    const imageUrl =
      supabase.storage
        .from("post-images")
        .getPublicUrl(item.image_storage_id)
        .data.publicUrl;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />

        <Typography variant="h3">
          {item.park_name}
        </Typography>

        {item.caption ? (
          <Typography variant="body">
            {item.caption}
          </Typography>
        ) : null}
      </View>
    );
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },

  card: {
    gap: 10,
    marginBottom: 24,
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
});