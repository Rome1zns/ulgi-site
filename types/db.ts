import type { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type AssignmentInsert = Database["public"]["Tables"]["assignments"]["Insert"];
export type AssignmentUpdate = Database["public"]["Tables"]["assignments"]["Update"];
export type AssignmentQuestion = Database["public"]["Tables"]["assignment_questions"]["Row"];
export type AssignmentQuestionInsert =
  Database["public"]["Tables"]["assignment_questions"]["Insert"];
export type AssignmentOption = Database["public"]["Tables"]["assignment_options"]["Row"];
export type AssignmentOptionInsert =
  Database["public"]["Tables"]["assignment_options"]["Insert"];
export type AssignmentAnswerKey =
  Database["public"]["Tables"]["assignment_answer_keys"]["Row"];
export type AssignmentSubmission =
  Database["public"]["Tables"]["assignment_submissions"]["Row"];
export type AssignmentAnswer = Database["public"]["Tables"]["assignment_answers"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type AiChat = Database["public"]["Tables"]["ai_chats"]["Row"];
export type AiMessage = Database["public"]["Tables"]["ai_messages"]["Row"];

export type PostWithAuthor = Post & { author: Profile };
export type CommentWithAuthor = Comment & { author: Profile };
