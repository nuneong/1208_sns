# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Next.js 15.5.6** with React 19 and App Router
- **Authentication**: Clerk (with Korean localization - koKR)
  - 한국어 로컬라이제이션 적용 (`@clerk/localizations`)
  - 커스텀 에러 메시지 포함
  - 자세한 내용: [Clerk 로컬라이제이션 가이드](./docs/clerk-localization.md)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 (uses `globals.css`, no config file)
  - Instagram 컬러 스키마 적용 (`--instagram-blue`, `--instagram-background` 등)
  - Instagram 타이포그래피 설정 (`--text-xs`, `--text-sm`, `--text-base`, `--text-xl` 등)
- **UI Components**: shadcn/ui (based on Radix UI)
- **Icons**: lucide-react
- **Forms**: react-hook-form + Zod
- **Package Manager**: pnpm
- **Language**: TypeScript (strict typing required)

## Development Commands

```bash
# Development server with turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## Project Architecture

### Clerk + Supabase Integration

이 프로젝트는 Clerk와 Supabase의 네이티브 통합 (2025년 4월 이후 권장 방식)을 사용합니다:

> **참고**: [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)를 참고하세요.

1. **인증 흐름**:

   - Clerk가 사용자 인증 처리
   - Clerk Dashboard에서 Supabase 통합 활성화 필요 (`https://dashboard.clerk.com/setup/supabase`)
   - Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정
   - `SyncUserProvider`가 로그인 시 자동으로 Clerk 사용자를 Supabase `users` 테이블에 동기화
   - Supabase 클라이언트가 Clerk 세션 토큰을 사용하여 인증 (JWT 템플릿 불필요, deprecated)

2. **Supabase 클라이언트 파일들** (`lib/supabase/`):

   - `clerk-client.ts`: Client Component용 (useClerkSupabaseClient hook)
     - `useAuth().getToken()`으로 Clerk 세션 토큰 가져오기
     - Clerk 세션 토큰으로 인증된 사용자의 데이터 접근
     - RLS 정책이 `auth.jwt()->>'sub'`로 Clerk user ID 확인
   - `server.ts`: Server Component/Server Action용 (createClient)
     - `await createClient()`로 Supabase 공식 문서 스타일 사용
     - `auth().getToken()`으로 서버 사이드에서 Clerk 인증 사용
     - Server Component와 Server Action에서 사용
     - `createClerkSupabaseClient()`는 하위 호환성을 위해 유지 (deprecated)
   - `service-role.ts`: 관리자 권한 작업용 (SUPABASE_SERVICE_ROLE_KEY 사용)
     - RLS 우회, 서버 사이드 전용
   - `client.ts`: 인증 불필요한 공개 데이터용
     - anon key만 사용, RLS 정책이 `to anon`인 데이터만 접근

3. **사용자 동기화**:
   - `hooks/use-sync-user.ts`: Clerk → Supabase 사용자 동기화 훅
   - `components/providers/sync-user-provider.tsx`: RootLayout에서 자동 실행
   - `app/api/sync-user/route.ts`: 실제 동기화 로직 (API 라우트)

4. **통합 설정 요구사항**:
   - Clerk Dashboard에서 Supabase 통합 활성화 (Clerk domain 복사)
   - Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 추가
   - 환경 변수 설정: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Directory Convention

프로젝트 파일은 `app` 외부에 저장:

- `app/`: 라우팅 전용 (page.tsx, layout.tsx, route.ts 등만)
- `components/`: 재사용 가능한 컴포넌트
  - `components/ui/`: shadcn 컴포넌트 (자동 생성, 수정 금지)
  - `components/providers/`: React Context 프로바이더들
- `lib/`: 유틸리티 함수 및 클라이언트 설정
  - `lib/supabase/`: Supabase 클라이언트들 (환경별로 분리)
  - `lib/utils.ts`: 공통 유틸리티 (cn 함수 등)
  - `lib/types.ts`: TypeScript 타입 정의 (User, Post, Like, Comment, Follow 등)
- `hooks/`: 커스텀 React Hook들
- `supabase/`: 데이터베이스 마이그레이션 및 설정
  - `supabase/migrations/`: SQL 마이그레이션 파일들
    - `20250115000000_create_sns_schema.sql`: 데이터베이스 스키마 (users, posts, likes, comments, follows)
    - `20250115000001_create_posts_storage.sql`: Storage 버킷 설정
  - `supabase/config.toml`: Supabase 프로젝트 설정
- `docs/`: 프로젝트 문서
  - `supabase-migration-guide.md`: 데이터베이스 마이그레이션 가이드
  - `supabase-storage-guide.md`: Storage 버킷 설정 가이드

**예정된 디렉토리** (아직 없지만 필요 시 생성):

- `actions/`: Server Actions (API 대신 우선 사용)
- `constants/`: 상수 값들
- `states/`: 전역 상태 (jotai 사용, 최소화)

### Naming Conventions

- **파일명**: kebab-case (예: `use-sync-user.ts`, `sync-user-provider.tsx`)
- **컴포넌트**: PascalCase (파일명은 여전히 kebab-case)
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase

## Database

### Supabase Migrations

마이그레이션 파일 명명 규칙: `YYYYMMDDHHmmss_description.sql`

예시:

```
supabase/migrations/20241030014800_create_users_table.sql
```

**중요**:

- 새 테이블 생성 시 반드시 Row Level Security (RLS) 활성화
- 개발 중에는 RLS를 비활성화할 수 있으나, 프로덕션에서는 활성화 필수
- RLS 정책은 세분화: select, insert, update, delete별로 각각 작성
- `anon`과 `authenticated` 역할별로 별도 정책 작성

### 현재 스키마

#### 데이터베이스 테이블

- `users`: Clerk 사용자와 동기화되는 사용자 정보
  - `id`: UUID (Primary Key)
  - `clerk_id`: TEXT (Unique, Clerk User ID)
  - `name`: TEXT
  - `created_at`: TIMESTAMPTZ
  - RLS: 개발 중 비활성화 (프로덕션에서는 활성화 필요)

- `posts`: 게시물 테이블
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key → users.id)
  - `image_url`: TEXT (Supabase Storage URL)
  - `caption`: TEXT (최대 2,200자)
  - `created_at`, `updated_at`: TIMESTAMPTZ
  - 인덱스: `idx_posts_user_id`, `idx_posts_created_at`
  - RLS: 개발 중 비활성화

- `likes`: 좋아요 테이블
  - `id`: UUID (Primary Key)
  - `post_id`: UUID (Foreign Key → posts.id)
  - `user_id`: UUID (Foreign Key → users.id)
  - `created_at`: TIMESTAMPTZ
  - UNIQUE(post_id, user_id): 중복 좋아요 방지
  - 인덱스: `idx_likes_post_id`, `idx_likes_user_id`
  - RLS: 개발 중 비활성화

- `comments`: 댓글 테이블
  - `id`: UUID (Primary Key)
  - `post_id`: UUID (Foreign Key → posts.id)
  - `user_id`: UUID (Foreign Key → users.id)
  - `content`: TEXT
  - `created_at`, `updated_at`: TIMESTAMPTZ
  - 인덱스: `idx_comments_post_id`, `idx_comments_user_id`, `idx_comments_created_at`
  - RLS: 개발 중 비활성화

- `follows`: 팔로우 관계 테이블
  - `id`: UUID (Primary Key)
  - `follower_id`: UUID (Foreign Key → users.id, 팔로우하는 사람)
  - `following_id`: UUID (Foreign Key → users.id, 팔로우받는 사람)
  - `created_at`: TIMESTAMPTZ
  - UNIQUE(follower_id, following_id): 중복 팔로우 방지
  - CHECK (follower_id != following_id): 자기 자신 팔로우 방지
  - 인덱스: `idx_follows_follower_id`, `idx_follows_following_id`
  - RLS: 개발 중 비활성화

#### 데이터베이스 Views

- `post_stats`: 게시물 통계 뷰 (좋아요 수, 댓글 수)
- `user_stats`: 사용자 통계 뷰 (게시물 수, 팔로워 수, 팔로잉 수)

#### 데이터베이스 Triggers

- `set_updated_at` on `posts`: posts 테이블 업데이트 시 updated_at 자동 갱신
- `set_updated_at` on `comments`: comments 테이블 업데이트 시 updated_at 자동 갱신

#### Storage 버킷

- `posts`: 게시물 이미지 저장소
  - 공개 읽기: 모든 사용자가 이미지 조회 가능
  - 파일 크기 제한: 5MB
  - 허용 파일 타입: image/jpeg, image/png, image/webp
  - 경로 구조: `posts/{userId}/{timestamp}-{filename}`
  - 정책:
    - INSERT: 인증된 사용자만 업로드 가능
    - SELECT: 모든 사용자가 읽기 가능 (공개 버킷)
    - DELETE: 인증된 사용자만 자신의 파일 삭제 가능
    - UPDATE: 인증된 사용자만 자신의 파일 업데이트 가능

- `uploads`: 사용자 파일 저장소 (기존)
  - 경로 구조: `{clerk_user_id}/{filename}`
  - RLS 정책:
    - INSERT: 인증된 사용자만 자신의 폴더에 업로드 가능
    - SELECT: 인증된 사용자만 자신의 파일 조회 가능
    - DELETE: 인증된 사용자만 자신의 파일 삭제 가능
    - UPDATE: 인증된 사용자만 자신의 파일 업데이트 가능
  - 정책은 `auth.jwt()->>'sub'` (Clerk user ID)로 사용자 확인

## Environment Variables

`.env.example` 참고하여 `.env` 파일 생성:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## Development Guidelines

### Server Actions vs API Routes

**우선순위**: Server Actions > API Routes

- 가능하면 항상 Server Actions 사용 (`actions/` 디렉토리)
- API Routes는 불가피한 경우에만 사용 (웹훅, 외부 API 등)
- 현재 `/api/sync-user`는 기존 구조상 API Route로 구현됨

### UI Components

1. **shadcn/ui 설치 확인**: 사용 전 `/components/ui/` 디렉토리 체크
2. **설치 명령어**: `pnpx shadcn@latest add [component-name]`
3. **아이콘**: lucide-react 사용 (`import { Icon } from 'lucide-react'`)

### Styling

- Tailwind CSS v4 사용 (설정은 `app/globals.css`에만)
- `tailwind.config.js` 파일은 사용하지 않음
- 다크/라이트 모드 지원 고려

### TypeScript

- 모든 코드에 타입 정의 필수
- 인터페이스 우선, 타입은 필요시만
- enum 대신 const 객체 사용
- `satisfies` 연산자로 타입 검증

### React 19 & Next.js 15 Patterns

```typescript
// Async Request APIs (항상 await 사용)
const cookieStore = await cookies();
const headersList = await headers();
const params = await props.params;
const searchParams = await props.searchParams;

// Server Component 우선
// 'use client'는 필요한 경우에만
```

## Key Files

- `middleware.ts`: Clerk 미들웨어 (인증 라우트 보호)
- `app/layout.tsx`: RootLayout with ClerkProvider + SyncUserProvider
- `lib/supabase.ts`: 레거시 Supabase 클라이언트 (사용 지양, 새 파일들 사용)
- `components.json`: shadcn/ui 설정

## Additional Cursor Rules

프로젝트에는 다음 Cursor 규칙들이 있습니다:

- `.cursor/rules/web/nextjs-convention.mdc`: Next.js 컨벤션
- `.cursor/rules/web/design-rules.mdc`: UI/UX 디자인 가이드
- `.cursor/rules/web/playwright-test-guide.mdc`: 테스트 가이드
- `.cursor/rules/supabase/`: Supabase 관련 규칙들

주요 원칙은 이 CLAUDE.md에 통합되어 있으나, 세부사항은 해당 파일들 참고.
