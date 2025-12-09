"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import type { PostWithUser, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/time";

/**
 * @file PostCard.tsx
 * @description Instagram 스타일 게시물 카드 컴포넌트
 *
 * PRD.md 스펙:
 * - 헤더: 프로필 이미지 32px, 사용자명, 시간, ⋯ 메뉴
 * - 이미지: 1:1 정사각형
 * - 액션 버튼: 좋아요, 댓글, 공유, 북마크
 * - 좋아요 수, 캡션, 댓글 미리보기
 */

interface PostCardProps {
  post: PostWithUser;
  onLikeClick?: () => void;
  onCommentClick?: () => void;
  comments?: CommentWithUser[]; // 최신 2개 댓글 (선택적)
}

export function PostCard({
  post,
  onLikeClick,
  onCommentClick,
  comments = [],
}: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);

  // 캡션 2줄 초과 여부 확인 (대략적인 계산)
  const captionLines = post.caption?.split("\n") || [];
  const shouldTruncate = captionLines.length > 2 || (post.caption?.length || 0) > 100;

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    onLikeClick?.();
  };

  // 최신 2개 댓글만 표시
  const previewComments = comments.slice(0, 2);
  const hasMoreComments = comments.length > 2 || post.comments_count > 2;

  return (
    <article className="w-full max-w-[630px] mx-auto bg-white border-b border-[#DBDBDB] sm:border-x sm:border-t sm:rounded-none">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 h-[60px]">
        {/* 프로필 이미지 */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <span className="text-sm font-semibold text-gray-600">
            {post.user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* 사용자명 및 시간 */}
        <div className="flex-1">
          <Link
            href={`/profile/${post.user.id}`}
            className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
          >
            {post.user.name}
          </Link>
          <span className="text-xs text-[#8e8e8e] ml-2">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>

        {/* ⋯ 메뉴 버튼 */}
        <button
          type="button"
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-5 h-5 text-[#262626]" />
        </button>
      </header>

      {/* 이미지 영역 */}
      <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* 액션 버튼 섹션 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <button
            type="button"
            onClick={handleLikeClick}
            className="hover:opacity-70 transition-opacity"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? "fill-[#ed4956] text-[#ed4956]" : "text-[#262626]"
              }`}
            />
          </button>

          {/* 댓글 버튼 */}
          <button
            type="button"
            onClick={onCommentClick}
            className="hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-[#262626]" />
          </button>

          {/* 공유 버튼 (UI만) */}
          <button
            type="button"
            className="hover:opacity-70 transition-opacity opacity-50 cursor-not-allowed"
            aria-label="공유"
            disabled
          >
            <Send className="w-6 h-6 text-[#262626]" />
          </button>
        </div>

        {/* 북마크 버튼 (UI만) */}
        <button
          type="button"
          className="hover:opacity-70 transition-opacity opacity-50 cursor-not-allowed"
          aria-label="저장"
          disabled
        >
          <Bookmark className="w-6 h-6 text-[#262626]" />
        </button>
      </div>

      {/* 좋아요 수 */}
      {post.likes_count > 0 && (
        <div className="px-4 pb-2">
          <p className="font-semibold text-[#262626] text-sm">
            좋아요 {post.likes_count.toLocaleString()}개
          </p>
        </div>
      )}

      {/* 캡션 */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p className="text-sm text-[#262626]">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              {post.user.name}
            </Link>{" "}
            <span className={showFullCaption ? "" : "line-clamp-2"}>
              {post.caption}
            </span>
            {shouldTruncate && !showFullCaption && (
              <button
                type="button"
                onClick={() => setShowFullCaption(true)}
                className="text-[#8e8e8e] hover:opacity-70 transition-opacity ml-1"
              >
                ... 더 보기
              </button>
            )}
          </p>
        </div>
      )}

      {/* 댓글 미리보기 */}
      {hasMoreComments && (
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={onCommentClick}
            className="text-sm text-[#8e8e8e] hover:opacity-70 transition-opacity"
          >
            댓글 {post.comments_count}개 모두 보기
          </button>
        </div>
      )}

      {/* 최신 댓글 2개 */}
      {previewComments.length > 0 && (
        <div className="px-4 pb-4 space-y-1">
          {previewComments.map((comment) => (
            <div key={comment.id} className="text-sm">
              <Link
                href={`/profile/${comment.user.id}`}
                className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
              >
                {comment.user.name}
              </Link>{" "}
              <span className="text-[#262626]">{comment.content}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

