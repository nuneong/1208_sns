import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type {
  PostWithUser,
  PaginatedResponse,
} from "@/lib/types";

/**
 * @file route.ts
 * @description 게시물 목록 조회 API
 *
 * GET /api/posts
 * - 게시물 목록을 시간 역순으로 반환
 * - 페이지네이션 지원 (limit, offset)
 * - userId 파라미터 지원 (프로필 페이지용)
 * - 현재 사용자의 좋아요 상태 포함
 *
 * @query limit?: number - 페이지당 항목 수 (기본값: 10)
 * @query offset?: number - 건너뛸 항목 수 (기본값: 0)
 * @query userId?: string - 특정 사용자의 게시물만 조회 (선택적)
 */

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId") || null;

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 사용자 ID 확인 (선택적 - 좋아요 상태 확인용)
    const { userId: currentUserId } = await auth();
    let currentUserSupabaseId: string | null = null;

    if (currentUserId) {
      // Clerk userId로 Supabase users 테이블에서 사용자 ID 찾기
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserId)
        .single();

      if (currentUser) {
        currentUserSupabaseId = currentUser.id;
      }
    }

    // post_stats 뷰에서 게시물 목록 조회
    let query = supabase
      .from("post_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId가 있으면 해당 사용자의 게시물만 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postStats, error: postStatsError } = await query;

    if (postStatsError) {
      console.error("Error fetching post stats:", postStatsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postStatsError.message },
        { status: 500 }
      );
    }

    if (!postStats || postStats.length === 0) {
      return NextResponse.json<PaginatedResponse<PostWithUser>>({
        data: [],
        has_more: false,
      });
    }

    // 각 게시물의 작성자 정보 가져오기
    const userIds = [...new Set(postStats.map((p) => p.user_id))];
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch user data", details: usersError.message },
        { status: 500 }
      );
    }

    // 현재 사용자가 좋아요한 게시물 ID 목록 가져오기
    let likedPostIds: string[] = [];
    if (currentUserSupabaseId) {
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserSupabaseId)
        .in(
          "post_id",
          postStats.map((p) => p.post_id)
        );

      if (likes) {
        likedPostIds = likes.map((l) => l.post_id);
      }
    }

    // PostWithUser 타입으로 변환
    const postsWithUser: PostWithUser[] = postStats.map((stat) => {
      const user = users?.find((u) => u.id === stat.user_id);
      if (!user) {
        throw new Error(`User not found for post ${stat.post_id}`);
      }

      return {
        id: stat.post_id,
        user_id: stat.user_id,
        image_url: stat.image_url,
        caption: stat.caption,
        created_at: stat.created_at,
        updated_at: stat.created_at, // post_stats 뷰에는 updated_at이 없으므로 created_at 사용
        user: {
          id: user.id,
          clerk_id: user.clerk_id,
          name: user.name,
          created_at: user.created_at,
        },
        likes_count: Number(stat.likes_count) || 0,
        comments_count: Number(stat.comments_count) || 0,
        is_liked: likedPostIds.includes(stat.post_id),
      };
    });

    // 더 많은 데이터가 있는지 확인
    const totalCount = postStats.length;
    const hasMore = totalCount === limit;

    return NextResponse.json<PaginatedResponse<PostWithUser>>({
      data: postsWithUser,
      has_more: hasMore,
      next_offset: hasMore ? offset + limit : undefined,
    });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

