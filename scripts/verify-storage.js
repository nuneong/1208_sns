#!/usr/bin/env node

/**
 * @file verify-storage.js
 * @description Storage 버킷 및 정책 검증 스크립트
 *
 * 이 스크립트는 Supabase Storage의 `posts` 버킷이 올바르게 생성되고
 * 정책이 설정되었는지 확인합니다.
 */

const { createClient } = require("@supabase/supabase-js");
const { checkEnvVars } = require("./check-env.js");

// 검증할 버킷 정보
const REQUIRED_BUCKET = {
  name: "posts",
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};

// 검증할 Storage 정책
const REQUIRED_POLICIES = [
  {
    name: "Authenticated users can upload posts",
    operation: "INSERT",
    target: "authenticated",
  },
  {
    name: "Public can read posts",
    operation: "SELECT",
    target: "public",
  },
  {
    name: "Users can delete own posts",
    operation: "DELETE",
    target: "authenticated",
  },
  {
    name: "Users can update own posts",
    operation: "UPDATE",
    target: "authenticated",
  },
];

async function verifyStorage() {
  console.log("=".repeat(60));
  console.log("Storage 버킷 검증");
  console.log("=".repeat(60));
  console.log();

  // 환경 변수 확인
  try {
    require("dotenv").config();
  } catch (e) {
    // dotenv가 없어도 계속 진행
  }

  const envCheck = checkEnvVars();
  if (!envCheck) {
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const results = {
    bucket: { exists: false, config: {} },
    policies: { passed: [], failed: [] },
  };

  console.log(`📦 버킷 확인 중: ${REQUIRED_BUCKET.name}\n`);

  // 버킷 존재 확인
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      throw error;
    }

    const postsBucket = buckets?.find((b) => b.id === REQUIRED_BUCKET.name);

    if (!postsBucket) {
      console.error(`  ❌ ${REQUIRED_BUCKET.name} 버킷이 존재하지 않습니다.`);
      console.error();
      console.error("💡 해결 방법:");
      console.error(
        "  1. Supabase Dashboard → SQL Editor에서 다음 파일 실행:"
      );
      console.error(
        "     supabase/migrations/20250115000001_create_posts_storage.sql"
      );
      console.error("  2. 또는 Supabase Dashboard → Storage → New bucket");
      console.error();
      process.exit(1);
    }

    results.bucket.exists = true;
    results.bucket.config = postsBucket;

    console.log(`  ✅ ${REQUIRED_BUCKET.name} 버킷이 존재합니다.`);
    console.log();

    // 버킷 설정 확인
    console.log("  📋 버킷 설정 확인:");
    console.log(
      `    ${postsBucket.public ? "✅" : "❌"} 공개 읽기: ${postsBucket.public ? "Yes" : "No"} (예상: Yes)`
    );
    
    if (postsBucket.file_size_limit) {
      const limitMB = (postsBucket.file_size_limit / 1024 / 1024).toFixed(2);
      const expectedMB = (REQUIRED_BUCKET.fileSizeLimit / 1024 / 1024).toFixed(2);
      const match = postsBucket.file_size_limit === REQUIRED_BUCKET.fileSizeLimit;
      console.log(
        `    ${match ? "✅" : "⚠️ "} 파일 크기 제한: ${limitMB}MB (예상: ${expectedMB}MB)`
      );
    }

    if (postsBucket.allowed_mime_types) {
      const match = JSON.stringify(postsBucket.allowed_mime_types.sort()) ===
        JSON.stringify(REQUIRED_BUCKET.allowedMimeTypes.sort());
      console.log(
        `    ${match ? "✅" : "⚠️ "} 허용 MIME 타입: ${postsBucket.allowed_mime_types.join(", ")}`
      );
    }

    console.log();
  } catch (error) {
    console.error(`  ❌ 버킷 확인 중 오류: ${error.message}`);
    console.error();
    console.error("💡 해결 방법:");
    console.error("  1. 환경 변수 확인: pnpm run check:env");
    console.error("  2. Supabase Dashboard에서 버킷 확인");
    console.error();
    process.exit(1);
  }

  console.log("📋 Storage 정책 확인 중...\n");

  // Storage 정책 확인 (SQL 쿼리 필요)
  console.log("  ⚠️  Storage 정책 확인은 SQL 쿼리로 직접 확인해야 합니다.");
  console.log("     scripts/verification-queries.sql 파일을 참고하세요.");
  console.log();
  console.log("  예상 정책:");
  REQUIRED_POLICIES.forEach((policy) => {
    console.log(`    - ${policy.name} (${policy.operation}, ${policy.target})`);
  });
  console.log();

  // 결과 리포트
  console.log("=".repeat(60));
  console.log("검증 결과");
  console.log("=".repeat(60));
  console.log();

  if (results.bucket.exists) {
    console.log("✅ `posts` 버킷이 존재합니다.");
    console.log();
    console.log("💡 다음 단계:");
    console.log("  1. Supabase Dashboard → Storage → Policies에서 정책 확인");
    console.log("  2. scripts/verification-queries.sql 파일로 상세 확인");
    console.log("  3. docs/supabase-storage-guide.md 참고");
    console.log();
  } else {
    console.error("❌ 버킷 검증 실패");
    process.exit(1);
  }
}

if (require.main === module) {
  verifyStorage().catch((error) => {
    console.error();
    console.error("❌ 검증 중 오류 발생:");
    console.error(error.message);
    console.error();
    process.exit(1);
  });
}

module.exports = { verifyStorage };


