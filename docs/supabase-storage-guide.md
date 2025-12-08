# Supabase Storage 버킷 설정 가이드

이 문서는 Instagram 클론 SNS 프로젝트의 Supabase Storage 버킷 설정 방법을 설명합니다.

## 개요

프로젝트는 게시물 이미지를 저장하기 위해 `posts` 버킷을 사용합니다. 이 버킷은:

- **공개 읽기**: 모든 사용자가 이미지를 조회할 수 있습니다
- **파일 크기 제한**: 5MB (PRD.md 스펙)
- **허용 파일 타입**: JPEG, PNG, WebP 이미지 파일만

## 버킷 생성 방법

### 방법 1: 마이그레이션 파일 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250115000001_create_posts_storage.sql` 파일의 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭
7. 성공 메시지 확인

### 방법 2: Supabase Dashboard UI 사용

1. Supabase Dashboard → **Storage** 메뉴
2. **New bucket** 클릭
3. 다음 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: ✅ 체크 (공개 읽기)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. **Create bucket** 클릭

## Storage 정책 확인

버킷 생성 후 다음 정책들이 설정되었는지 확인:

### 1. 업로드 정책

- **이름**: "Authenticated users can upload posts"
- **권한**: INSERT
- **대상**: authenticated
- **설명**: 인증된 사용자만 업로드 가능

### 2. 읽기 정책

- **이름**: "Public can read posts"
- **권한**: SELECT
- **대상**: public
- **설명**: 모든 사용자가 이미지 조회 가능 (공개 버킷)

### 3. 삭제 정책

- **이름**: "Users can delete own posts"
- **권한**: DELETE
- **대상**: authenticated
- **설명**: 사용자는 자신이 업로드한 파일만 삭제 가능

### 4. 업데이트 정책

- **이름**: "Users can update own posts"
- **권한**: UPDATE
- **대상**: authenticated
- **설명**: 사용자는 자신이 업로드한 파일만 업데이트 가능

## 파일 경로 구조

게시물 이미지는 다음 경로 구조로 저장됩니다:

```
posts/{userId}/{timestamp}-{filename}
```

예시:
```
posts/user_2abc123def456/1705123456789-photo.jpg
```

### 경로 구성 요소

- `{userId}`: Clerk user ID (Clerk 세션 토큰의 `sub` claim)
- `{timestamp}`: 업로드 시각 (밀리초 단위)
- `{filename}`: 원본 파일명

## 코드에서 사용하기

### 이미지 업로드 예시

```typescript
import { createClient } from '@/lib/supabase/server';

export async function uploadPostImage(
  userId: string,
  file: File
): Promise<string> {
  const supabase = await createClient();
  
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('posts')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  // 공개 URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

### 이미지 조회 예시

```typescript
// 공개 URL로 직접 접근 가능
const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/posts/${filePath}`;

// 또는 Supabase 클라이언트 사용
const { data } = supabase.storage
  .from('posts')
  .getPublicUrl(filePath);
```

## 버킷 설정 확인

### 1. 버킷 생성 확인

Supabase Dashboard → **Storage** → **Buckets**에서 `posts` 버킷이 생성되었는지 확인:

- ✅ 버킷 이름: `posts`
- ✅ 공개 버킷: Yes
- ✅ 파일 크기 제한: 5MB
- ✅ 허용 MIME 타입: image/jpeg, image/png, image/webp

### 2. 정책 확인

Supabase Dashboard → **Storage** → **Policies**에서 다음 정책들이 생성되었는지 확인:

- ✅ Authenticated users can upload posts
- ✅ Public can read posts
- ✅ Users can delete own posts
- ✅ Users can update own posts

### 3. 테스트 업로드

SQL Editor에서 다음 쿼리로 버킷이 올바르게 설정되었는지 확인:

```sql
-- 버킷 정보 확인
SELECT * FROM storage.buckets WHERE id = 'posts';

-- 정책 확인
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%posts%';
```

## 파일 업로드 제한사항

### 파일 크기

- **최대 크기**: 5MB (5,242,880 bytes)
- **초과 시**: 업로드 실패

### 파일 타입

- **허용**: JPEG, PNG, WebP
- **제한**: 그 외 모든 파일 타입은 업로드 불가

### 파일명

- 특수 문자는 자동으로 이스케이프 처리됩니다
- 경로 구조에 따라 `{userId}/{timestamp}-{filename}` 형식으로 저장됩니다

## 문제 해결

### 에러: "Bucket already exists"

버킷이 이미 존재하는 경우, 마이그레이션 파일의 `ON CONFLICT DO UPDATE` 구문으로 설정이 업데이트됩니다.

### 에러: "File size exceeds limit"

파일 크기가 5MB를 초과하는 경우:

1. 이미지 압축 도구 사용
2. 이미지 리사이징
3. 또는 버킷 설정에서 파일 크기 제한 증가 (권장하지 않음)

### 에러: "Invalid file type"

허용되지 않은 파일 타입을 업로드하려는 경우:

1. JPEG, PNG, WebP 형식으로 변환
2. 또는 버킷 설정에서 허용 MIME 타입 추가 (권장하지 않음)

## 보안 고려사항

### 공개 버킷

`posts` 버킷은 공개 읽기가 가능하므로:

- ✅ 모든 사용자가 이미지 URL을 통해 직접 접근 가능
- ✅ CDN을 통한 빠른 이미지 로딩
- ⚠️ 민감한 정보는 저장하지 않기

### 업로드 제한

- 인증된 사용자만 업로드 가능
- 파일 크기 및 타입 제한으로 악의적 업로드 방지

### 삭제/업데이트 제한

- 사용자는 자신이 업로드한 파일만 삭제/업데이트 가능
- 파일 경로의 `userId` 부분으로 소유자 확인

## 다음 단계

Storage 버킷 설정이 완료되면:

1. 애플리케이션에서 이미지 업로드 기능 구현
2. 이미지 최적화 (리사이징, 압축) 고려
3. CDN 설정 (Supabase Storage는 자동으로 CDN 제공)

## 참고 자료

- [Supabase 공식 문서 - Storage](https://supabase.com/docs/guides/storage)
- [Supabase 공식 문서 - Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

