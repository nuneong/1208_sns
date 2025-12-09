import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

/**
 * @file layout.tsx
 * @description Instagram 스타일 메인 레이아웃
 *
 * PRD.md 스펙:
 * - Desktop: Sidebar (244px) + Main Content (최대 630px, 중앙 정렬)
 * - Tablet: Sidebar (72px) + Main Content (전체 너비)
 * - Mobile: Header (60px) + Main Content + BottomNav (50px)
 * - 배경색: #FAFAFA
 */

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar: Desktop/Tablet에만 표시 */}
      <Sidebar />

      {/* Header: Mobile에만 표시 */}
      <Header />

      {/* Main Content */}
      <main
        className={cn(
          // Desktop: Sidebar 너비만큼 왼쪽 마진, 최대 630px, 중앙 정렬
          "lg:ml-[244px] lg:max-w-[630px] lg:mx-auto",
          // Tablet: Sidebar 너비만큼 왼쪽 마진, 전체 너비
          "md:ml-[72px]",
          // Mobile: 전체 너비, 상하 패딩 (Header/BottomNav 높이만큼)
          "pt-[60px] pb-[50px] lg:pt-0 lg:pb-0"
        )}
      >
        {children}
      </main>

      {/* BottomNav: Mobile에만 표시 */}
      <BottomNav />
    </div>
  );
}

