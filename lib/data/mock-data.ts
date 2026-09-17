import type { PostWithAuthor, Announcement, Profile } from "@/types/db";
import dbData from "./db.json";

const profilesMap = new Map<string, Profile>(
  (dbData.profiles as Profile[]).map((p) => [p.id, p])
);

export const MOCK_PROFILES: Profile[] = dbData.profiles as Profile[];

export const MOCK_ANNOUNCEMENTS: Announcement[] = dbData.announcements as Announcement[];

export const MOCK_POSTS: PostWithAuthor[] = (dbData.posts as any[]).map((post) => {
  const author = profilesMap.get(post.author_id) || {
    id: post.author_id,
    phone: "+77000000000",
    username: "user",
    full_name: "Úlgi қолданушысы",
    class_name: "Мектеп",
    role: "student",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=ulgi",
    bio: null,
    is_banned: false,
    followers_count: 0,
    following_count: 0,
    created_at: post.created_at,
  };

  return {
    ...post,
    author,
  } as PostWithAuthor;
});
