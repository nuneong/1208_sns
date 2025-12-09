"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file BottomNav.tsx
 * @description Instagram 스타일 모바일 하단 네비게이션 컴포넌트
 *
 * PRD.md 스펙:
 * - Mobile 전용 (50px 높이)
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 * - Desktop/Tablet에서는 숨김
 */

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

const navItems: NavItem[] = [
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
    href: "/activity",
    icon: Heart,
    label: "좋아요",
  },
  {
    href: "/profile",
    icon: User,
    label: "프로필",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-[50px]",
        "bg-white border-t border-[#DBDBDB]",
        "flex justify-around items-center",
        "z-50",
        "flex lg:hidden" // Mobile에서만 표시
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.onClick}
            className={cn(
              "flex items-center justify-center",
              "p-2 hover:opacity-70 transition-opacity",
              "flex-1"
            )}
            aria-label={item.label}
          >
            <Icon
              className={cn(
                "w-6 h-6",
                isActive ? "text-[#262626]" : "text-[#8e8e8e]"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

