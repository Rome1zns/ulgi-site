export const CLASS_NAMES = [
  "1A", "1\u0411", "1\u0412",
  "2A", "2\u0411", "2\u0412",
  "3A", "3\u0411", "3\u0412",
  "4A", "4\u0411", "4\u0412",
  "5A", "5\u0411", "5\u0412",
  "6A", "6\u0411", "6\u0412",
  "7A", "7\u0411", "7\u0412",
  "8A", "8\u0411", "8\u0412",
  "9A", "9\u0411", "9\u0412",
  "10A", "10\u0411", "10\u0412",
  "11A", "11\u0411", "11\u0412",
] as const;

export type ClassName = (typeof CLASS_NAMES)[number];

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "event", label: "Іс-шаралар" },
  { value: "sport", label: "Спорт" },
  { value: "academic", label: "Оқу" },
  { value: "general", label: "Жалпы" },
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number]["value"];

export const USER_ROLES = ["student", "teacher", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MEDIA_TYPES = ["none", "image", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MODERATION_STATUSES = ["approved", "pending", "rejected"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const MAX_POST_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 500;
export const MAX_BIO_LENGTH = 200;
export const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME || "№42 мектеп";
