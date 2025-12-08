/**
 * @file types.ts
 * @description Instagram 클론 SNS 프로젝트의 TypeScript 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스 스키마를 기반으로 한 타입 정의를 포함합니다.
 * PRD.md와 db.sql의 스키마를 참고하여 작성되었습니다.
 *
 * @see docs/PRD.md
 * @see supabase/migrations/20250115000000_create_sns_schema.sql
 */

// ============================================
// 기본 엔티티 타입
// ============================================

/**
 * User 타입 (users 테이블 기반)
 */
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk 사용자 ID (Unique)
  name: string; // 사용자 이름
  created_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * Post 타입 (posts 테이블 기반)
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID (Foreign Key → users.id)
  image_url: string; // Supabase Storage URL
  caption: string | null; // 캡션 (최대 2,200자, 애플리케이션에서 검증)
  created_at: string; // ISO 8601 형식의 타임스탬프
  updated_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * Like 타입 (likes 테이블 기반)
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID (Foreign Key → posts.id)
  user_id: string; // UUID (Foreign Key → users.id)
  created_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * Comment 타입 (comments 테이블 기반)
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID (Foreign Key → posts.id)
  user_id: string; // UUID (Foreign Key → users.id)
  content: string; // 댓글 내용
  created_at: string; // ISO 8601 형식의 타임스탬프
  updated_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * Follow 타입 (follows 테이블 기반)
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (Foreign Key → users.id, 팔로우하는 사람)
  following_id: string; // UUID (Foreign Key → users.id, 팔로우받는 사람)
  created_at: string; // ISO 8601 형식의 타임스탬프
}

// ============================================
// 확장 타입 (API 응답용)
// ============================================

/**
 * PostWithUser - 게시물과 작성자 정보를 포함한 타입
 * API 응답에서 사용
 */
export interface PostWithUser extends Post {
  user: User;
  likes_count: number; // 좋아요 수 (post_stats 뷰에서 가져옴)
  comments_count: number; // 댓글 수 (post_stats 뷰에서 가져옴)
  is_liked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
}

/**
 * CommentWithUser - 댓글과 작성자 정보를 포함한 타입
 * API 응답에서 사용
 */
export interface CommentWithUser extends Comment {
  user: User;
}

/**
 * UserWithStats - 사용자와 통계 정보를 포함한 타입
 * 프로필 페이지에서 사용
 */
export interface UserWithStats extends User {
  posts_count: number; // 게시물 수 (user_stats 뷰에서 가져옴)
  followers_count: number; // 팔로워 수 (user_stats 뷰에서 가져옴)
  following_count: number; // 팔로잉 수 (user_stats 뷰에서 가져옴)
  is_following?: boolean; // 현재 사용자가 이 사용자를 팔로우하는지 여부 (선택적)
}

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * 게시물 생성 요청 타입
 */
export interface CreatePostRequest {
  image: File; // 이미지 파일
  caption: string; // 캡션 (최대 2,200자)
}

/**
 * 게시물 생성 응답 타입
 */
export interface CreatePostResponse {
  post: Post;
  image_url: string; // 업로드된 이미지의 공개 URL
}

/**
 * 댓글 작성 요청 타입
 */
export interface CreateCommentRequest {
  post_id: string;
  content: string;
}

/**
 * 댓글 작성 응답 타입
 */
export interface CreateCommentResponse {
  comment: CommentWithUser;
}

/**
 * 좋아요 토글 응답 타입
 */
export interface ToggleLikeResponse {
  is_liked: boolean; // 좋아요 상태
  likes_count: number; // 업데이트된 좋아요 수
}

/**
 * 팔로우 토글 응답 타입
 */
export interface ToggleFollowResponse {
  is_following: boolean; // 팔로우 상태
  followers_count: number; // 업데이트된 팔로워 수
}

// ============================================
// 페이지네이션 타입
// ============================================

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  limit?: number; // 페이지당 항목 수 (기본값: 10)
  offset?: number; // 건너뛸 항목 수 (기본값: 0)
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean; // 더 많은 데이터가 있는지 여부
  next_offset?: number; // 다음 페이지의 offset
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 데이터베이스 뷰 타입
 */

/**
 * post_stats 뷰 타입
 */
export interface PostStats {
  post_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

/**
 * user_stats 뷰 타입
 */
export interface UserStats {
  user_id: string;
  clerk_id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
}

