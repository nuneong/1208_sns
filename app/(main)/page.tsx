import { PostFeed } from "@/components/post/PostFeed";

/**
 * @file page.tsx
 * @description Instagram 홈 피드 페이지
 *
 * PostFeed 컴포넌트를 통합하여 게시물 목록을 표시합니다.
 * 배경색은 layout.tsx에서 설정됨 (#FAFAFA)
 */

export default function HomePage() {
  return (
    <div className="w-full py-4">
      <PostFeed />
    </div>
  );
}

