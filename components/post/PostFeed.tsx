"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import type { PostWithUser, PaginatedResponse } from "@/lib/types";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트 (무한 스크롤 포함)
 *
 * PRD.md 스펙:
 * - 게시물 목록 렌더링
 * - 무한 스크롤 (Intersection Observer)
 * - 페이지네이션 (10개씩)
 * - 로딩 상태 처리
 */

interface PostFeedProps {
  userId?: string; // 프로필 페이지용 (선택적)
}

export function PostFeed({ userId }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const limit = 10;

  // 게시물 데이터 페칭
  const fetchPosts = useCallback(
    async (currentOffset: number, append: boolean = false) => {
      try {
        if (currentOffset === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: currentOffset.toString(),
        });

        if (userId) {
          params.append("userId", userId);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data: PaginatedResponse<PostWithUser> = await response.json();

        if (append) {
          setPosts((prev) => [...prev, ...data.data]);
        } else {
          setPosts(data.data);
        }

        setHasMore(data.has_more);
        setOffset(currentOffset + data.data.length);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(
          err instanceof Error ? err.message : "게시물을 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, limit]
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPosts(offset, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, offset, fetchPosts]);

  // 좋아요 클릭 핸들러 (추후 구현)
  const handleLikeClick = () => {
    // TODO: 좋아요 API 호출 (4단계에서 구현)
  };

  // 댓글 클릭 핸들러 (추후 구현)
  const handleCommentClick = () => {
    // TODO: 댓글 모달/페이지 열기 (6단계에서 구현)
  };

  // 에러 상태 재시도
  const handleRetry = () => {
    setError(null);
    fetchPosts(0, false);
  };

  // 초기 로딩 상태
  if (loading) {
    return (
      <div className="w-full space-y-0">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <div className="w-full max-w-[630px] mx-auto px-4 py-8 text-center">
        <p className="text-[#8e8e8e] mb-4">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 데이터 상태
  if (posts.length === 0 && !loading) {
    return (
      <div className="w-full max-w-[630px] mx-auto px-4 py-8 text-center">
        <p className="text-[#8e8e8e]">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-0">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeClick={handleLikeClick}
          onCommentClick={handleCommentClick}
        />
      ))}

      {/* 추가 로딩 상태 */}
      {loadingMore && (
        <div className="w-full">
          <PostCardSkeleton />
        </div>
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="w-full max-w-[630px] mx-auto px-4 py-8 text-center">
          <p className="text-sm text-[#8e8e8e]">더 이상 게시물이 없습니다.</p>
        </div>
      )}

      {/* Intersection Observer 타겟 */}
      <div ref={observerTarget} className="h-1" aria-hidden="true" />

      {/* 에러 상태 (일부 데이터가 있을 때) */}
      {error && posts.length > 0 && (
        <div className="w-full max-w-[630px] mx-auto px-4 py-4 text-center">
          <p className="text-sm text-[#8e8e8e] mb-2">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm text-[#0095f6] hover:opacity-70 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

