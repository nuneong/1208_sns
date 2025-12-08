# Supabase 데이터베이스 마이그레이션 가이드

이 문서는 Instagram 클론 SNS 프로젝트의 데이터베이스 스키마를 Supabase에 적용하는 방법을 설명합니다.

## 개요

프로젝트의 데이터베이스 스키마는 `supabase/migrations/20250115000000_create_sns_schema.sql` 파일에 정의되어 있습니다. 이 마이그레이션 파일은 다음을 포함합니다:

- **테이블**: users, posts, likes, comments, follows
- **Views**: post_stats, user_stats
- **Triggers**: updated_at 자동 업데이트

## 마이그레이션 적용 방법

### 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250115000000_create_sns_schema.sql` 파일의 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
7. 성공 메시지 확인

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트에 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

## 마이그레이션 확인

### 1. 테이블 생성 확인

Supabase Dashboard → **Table Editor**에서 다음 테이블들이 생성되었는지 확인:

- ✅ `users` - 사용자 정보
- ✅ `posts` - 게시물
- ✅ `likes` - 좋아요
- ✅ `comments` - 댓글
- ✅ `follows` - 팔로우 관계

### 2. 인덱스 확인

각 테이블의 인덱스가 올바르게 생성되었는지 확인:

**posts 테이블:**
- `idx_posts_user_id` - user_id 인덱스
- `idx_posts_created_at` - created_at 인덱스 (DESC)

**likes 테이블:**
- `idx_likes_post_id` - post_id 인덱스
- `idx_likes_user_id` - user_id 인덱스

**comments 테이블:**
- `idx_comments_post_id` - post_id 인덱스
- `idx_comments_user_id` - user_id 인덱스
- `idx_comments_created_at` - created_at 인덱스 (DESC)

**follows 테이블:**
- `idx_follows_follower_id` - follower_id 인덱스
- `idx_follows_following_id` - following_id 인덱스

### 3. Views 확인

Supabase Dashboard → **Database** → **Views**에서 다음 뷰들이 생성되었는지 확인:

- ✅ `post_stats` - 게시물 통계 (좋아요 수, 댓글 수)
- ✅ `user_stats` - 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

뷰를 테스트하려면 SQL Editor에서 다음 쿼리를 실행:

```sql
-- post_stats 뷰 테스트
SELECT * FROM public.post_stats LIMIT 5;

-- user_stats 뷰 테스트
SELECT * FROM public.user_stats LIMIT 5;
```

### 4. Triggers 확인

Supabase Dashboard → **Database** → **Triggers**에서 다음 트리거들이 생성되었는지 확인:

- ✅ `set_updated_at` on `posts` - posts 테이블 업데이트 시 updated_at 자동 갱신
- ✅ `set_updated_at` on `comments` - comments 테이블 업데이트 시 updated_at 자동 갱신

트리거를 테스트하려면:

```sql
-- posts 테이블 업데이트 테스트
UPDATE public.posts 
SET caption = 'Updated caption' 
WHERE id = (SELECT id FROM public.posts LIMIT 1);

-- updated_at이 자동으로 갱신되었는지 확인
SELECT id, caption, updated_at FROM public.posts 
WHERE caption = 'Updated caption';
```

## 테이블 구조

### users 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| clerk_id | TEXT | Clerk 사용자 ID (Unique) |
| name | TEXT | 사용자 이름 |
| created_at | TIMESTAMPTZ | 생성 시간 |

### posts 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key → users.id |
| image_url | TEXT | Supabase Storage URL |
| caption | TEXT | 캡션 (최대 2,200자) |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### likes 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| post_id | UUID | Foreign Key → posts.id |
| user_id | UUID | Foreign Key → users.id |
| created_at | TIMESTAMPTZ | 생성 시간 |
| UNIQUE(post_id, user_id) | - | 중복 좋아요 방지 |

### comments 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| post_id | UUID | Foreign Key → posts.id |
| user_id | UUID | Foreign Key → users.id |
| content | TEXT | 댓글 내용 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### follows 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| follower_id | UUID | Foreign Key → users.id (팔로우하는 사람) |
| following_id | UUID | Foreign Key → users.id (팔로우받는 사람) |
| created_at | TIMESTAMPTZ | 생성 시간 |
| UNIQUE(follower_id, following_id) | - | 중복 팔로우 방지 |
| CHECK (follower_id != following_id) | - | 자기 자신 팔로우 방지 |

## 주의사항

### RLS (Row Level Security)

현재 마이그레이션에서는 **RLS가 비활성화**되어 있습니다. 이는 개발 단계에서 편의를 위한 설정입니다.

프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정해야 합니다:

```sql
-- RLS 활성화 예시
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 예시 정책: 사용자는 자신의 게시물만 조회 가능
CREATE POLICY "Users can view own posts"
ON public.posts FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = (SELECT clerk_id FROM public.users WHERE id = user_id));
```

### 기존 데이터

마이그레이션을 실행하기 전에 기존 데이터가 있다면 백업을 권장합니다.

## 문제 해결

### 에러: "relation already exists"

테이블이 이미 존재하는 경우, 마이그레이션 파일의 `CREATE TABLE IF NOT EXISTS` 구문으로 인해 에러 없이 건너뜁니다. 하지만 완전히 새로 시작하려면:

```sql
-- 주의: 모든 데이터가 삭제됩니다!
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

### 에러: "function already exists"

트리거 함수가 이미 존재하는 경우, `CREATE OR REPLACE FUNCTION` 구문으로 업데이트됩니다.

## 다음 단계

마이그레이션이 완료되면:

1. [Storage 버킷 설정 가이드](./supabase-storage-guide.md) 참고하여 posts 버킷 생성
2. 애플리케이션에서 데이터베이스 연결 테스트
3. 샘플 데이터 삽입하여 테스트

## 참고 자료

- [Supabase 공식 문서 - Database](https://supabase.com/docs/guides/database)
- [Supabase 공식 문서 - Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

