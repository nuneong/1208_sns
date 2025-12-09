"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 반응형 사이드바 컴포넌트
 *
 * PRD.md 스펙:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px ~ 1023px): 72px 너비, 아이콘만
 * - Mobile (< 768px): 숨김
 *
 * 메뉴 항목:
 * - 홈 (/)
 * - 검색 (/explore) - 1차 MVP에서는 UI만
 * - 만들기 (모달 열기 - 추후 구현)
 * - 프로필 (/profile)
 */

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

const menuItems: MenuItem[] = [
  {
    href: "/",
    icon: Home,
    label: "홈",
  },
  {
    href: "/explore",
    icon: Search,
    label: "검색",
  },
  {
    href: "#",
    icon: Plus,
    label: "만들기",
    onClick: () => {
      // TODO: CreatePostModal 열기 (추후 구현)
    },
  },
  {
    href: "/profile",
    icon: User,
    label: "프로필",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-[#DBDBDB]",
        "hidden lg:block", // Mobile에서는 숨김
        "z-40"
      )}
    >
      <div
        className={cn(
          "h-full flex flex-col",
          "w-[72px] md:w-[72px]", // Tablet: 72px
          "lg:w-[244px]" // Desktop: 244px
        )}
      >
        <div className="p-4">
          {/* Instagram 로고 또는 텍스트 */}
          <div className="mb-8">
            <h1
              className={cn(
                "text-xl font-bold text-[#262626]",
                "hidden lg:block" // Desktop에서만 텍스트 표시
              )}
            >
              Instagram
            </h1>
          </div>

          {/* 메뉴 항목 */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-lg",
                    "transition-colors duration-200",
                    "hover:bg-gray-50",
                    // Tablet에서는 아이콘만, Desktop에서는 아이콘 + 텍스트
                    "md:justify-center md:px-2",
                    "lg:justify-start lg:px-4"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 flex-shrink-0",
                      isActive ? "text-[#262626]" : "text-[#262626]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[14px]",
                      "hidden lg:block", // Desktop에서만 텍스트 표시
                      isActive ? "font-bold text-[#262626]" : "text-[#262626]"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}

