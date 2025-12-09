-- ============================================
-- Storage: uploads 버킷 정책 수정
-- ============================================
-- 개발 단계에서 RLS 정책 완화 또는 비활성화
-- ============================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- 개발 단계: 모든 인증된 사용자가 uploads 버킷에 업로드 가능
-- 프로덕션에서는 더 엄격한 정책으로 교체 필요
CREATE POLICY "Authenticated users can upload to uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 개발 단계: 모든 인증된 사용자가 uploads 버킷의 파일 조회 가능
-- 프로덕션에서는 자신의 파일만 조회하도록 제한 필요
CREATE POLICY "Authenticated users can view uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');

-- 개발 단계: 모든 인증된 사용자가 uploads 버킷의 파일 삭제 가능
-- 프로덕션에서는 자신의 파일만 삭제하도록 제한 필요
CREATE POLICY "Authenticated users can delete uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- 개발 단계: 모든 인증된 사용자가 uploads 버킷의 파일 업데이트 가능
-- 프로덕션에서는 자신의 파일만 업데이트하도록 제한 필요
CREATE POLICY "Authenticated users can update uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

