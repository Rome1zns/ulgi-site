import Link from "next/link";
import { PostActions } from "./post-actions";
import { PostMenu } from "./post-menu";
import { relativeTime } from "@/lib/utils/time";
import { optimizeUrl } from "@/lib/cloudinary/upload";
import type { PostWithAuthor } from "@/types/db";

interface PostCardProps {
  post: PostWithAuthor;
  initialLiked?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, initialLiked = false, onDelete }: PostCardProps) {
  const author = post.author;
  const displayName = author?.full_name || "Белгісіз";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card-duo">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-[var(--duo-border)] bg-[var(--duo-bg)]">
          {author?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={author.avatar_url} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[var(--duo-text-secondary)]">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--duo-text)]">{displayName}</p>
          <div className="flex items-center gap-2 text-xs text-[var(--duo-text-secondary)]">
            {author?.class_name && (
              <span className="badge-duo bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]" style={{fontSize: 10, padding: '2px 8px'}}>
                {author.class_name}
              </span>
            )}
            <span className="font-semibold">{relativeTime(post.created_at)}</span>
          </div>
        </div>
        <PostMenu
          postId={post.id}
          authorId={post.author_id}
          mediaPublicId={post.media_public_id}
          mediaType={post.media_type}
          onDeleted={() => onDelete?.(post.id)}
        />
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`}>
        <p className="mb-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--duo-text)]">
          {post.content}
        </p>
      </Link>

      {/* Media */}
      {post.media_type === "image" && post.media_urls?.[0] && (
        <div className="mb-3 overflow-hidden rounded-[var(--radius-md)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={optimizeUrl(post.media_urls[0])} alt="" className="w-full max-h-[400px] object-cover" loading="lazy" />
        </div>
      )}
      {post.media_type === "video" && post.media_urls?.[0] && (
        <video src={post.media_urls[0]} controls className="mb-3 w-full rounded-[var(--radius-md)] max-h-[400px]" preload="metadata" />
      )}

      {/* Actions */}
      <PostActions
        postId={post.id}
        initialLiked={initialLiked}
        likesCount={post.likes_count}
        commentsCount={post.comments_count}
      />
    </article>
  );
}
