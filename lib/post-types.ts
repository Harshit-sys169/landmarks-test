export type ProfileRow = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_storage_id: string | null;
};

export type PostRow = {
  id: string;
  author_id: string;
  image_storage_id: string;
  park_name: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type FeedPost = PostRow & {
  profile: ProfileRow | null;
  imageUrl: string;
  avatarUrl: string | null;
};