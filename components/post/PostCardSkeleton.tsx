/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 상태 Skeleton UI
 *
 * PostCard와 동일한 레이아웃을 가진 Skeleton 컴포넌트입니다.
 * Shimmer 애니메이션 효과를 포함합니다.
 */

export function PostCardSkeleton() {
  return (
    <div className="w-full max-w-[630px] mx-auto bg-white border-b border-[#DBDBDB] sm:border-x sm:border-t sm:rounded-none">
      {/* 헤더 Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 h-[60px]">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 이미지 Skeleton */}
      <div className="w-full aspect-square bg-gray-200 animate-pulse" />

      {/* 액션 버튼 Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 좋아요 수 Skeleton */}
      <div className="px-4 pb-2">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 캡션 Skeleton */}
      <div className="px-4 pb-2 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 댓글 미리보기 Skeleton */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

