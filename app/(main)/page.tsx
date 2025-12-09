/**
 * @file page.tsx
 * @description Instagram 홈 피드 페이지
 *
 * 기본 구조만 구현 (콘텐츠는 3단계에서 구현)
 * 배경색은 layout.tsx에서 설정됨 (#FAFAFA)
 */

export default function HomePage() {
  return (
    <div className="w-full">
      {/* TODO: PostFeed 컴포넌트 통합 (3단계에서 구현) */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#262626]">홈 피드</h1>
        <p className="text-[#8e8e8e] mt-2">
          게시물 목록이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  );
}

