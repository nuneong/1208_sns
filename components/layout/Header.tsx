"use client";

import Link from "next/link";
import { Heart, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file Header.tsx
 * @description Instagram 스타일 모바일 헤더 컴포넌트
 *
 * PRD.md 스펙:
 * - Mobile 전용 (60px 높이)
 * - 로고 + 알림/DM/프로필 아이콘
 * - Desktop/Tablet에서는 숨김
 */

export default function Header() {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-[60px]",
        "bg-white border-b border-[#DBDBDB]",
        "flex justify-between items-center px-4",
        "z-50",
        "flex lg:hidden" // Mobile에서만 표시
      )}
    >
      {/* 좌측: Instagram 로고 */}
      <div>
        <h1 className="text-xl font-bold text-[#262626]">Instagram</h1>
      </div>

      {/* 우측: 아이콘 그룹 */}
      <div className="flex items-center gap-4">
        {/* 알림 아이콘 (1차 MVP에서는 UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="알림"
        >
          <Heart className="w-6 h-6 text-[#262626]" />
        </button>

        {/* DM 아이콘 (1차 MVP에서는 UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="메시지"
        >
          <Send className="w-6 h-6 text-[#262626]" />
        </button>

        {/* 프로필 아이콘 */}
        <Link
          href="/profile"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="프로필"
        >
          <User className="w-6 h-6 text-[#262626]" />
        </Link>
      </div>
    </header>
  );
}

