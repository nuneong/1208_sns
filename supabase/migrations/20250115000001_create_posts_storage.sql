-- ============================================
-- Storage: posts 버킷 생성 및 정책 설정
-- ============================================
-- Instagram 클론 SNS 프로젝트용 게시물 이미지 저장소
-- ============================================

-- posts 버킷 생성 (공개 읽기)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- 공개 읽기 (모든 사용자가 이미지 조회 가능)
  5242880,  -- 5MB 제한 (PRD.md 스펙: 최대 5MB)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- Storage 정책 설정
-- ============================================

-- 업로드 정책: 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- 읽기 정책: 모든 사용자가 읽기 가능 (공개 버킷)
CREATE POLICY "Public can read posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- 삭제 정책: 인증된 사용자만 자신이 업로드한 파일 삭제 가능
-- 파일 경로 구조: posts/{userId}/{timestamp}-{filename}
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- 업데이트 정책: 인증된 사용자만 자신이 업로드한 파일 업데이트 가능
CREATE POLICY "Users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

