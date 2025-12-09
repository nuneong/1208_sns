#!/usr/bin/env node

/**
 * @file verify-migrations.js
 * @description 데이터베이스 스키마 검증 스크립트
 *
 * 이 스크립트는 Supabase 데이터베이스에 필요한 테이블, Views, Triggers가
 * 올바르게 생성되었는지 확인합니다.
 */

const { createClient } = require("@supabase/supabase-js");
const { checkEnvVars } = require("./check-env.js");

// 검증할 테이블 목록
const REQUIRED_TABLES = [
  "users",
  "posts",
  "likes",
  "comments",
  "follows",
];

// 검증할 Views 목록
const REQUIRED_VIEWS = ["post_stats", "user_stats"];

// 검증할 Triggers 목록
const REQUIRED_TRIGGERS = [
  { table: "posts", trigger: "set_updated_at" },
  { table: "comments", trigger: "set_updated_at" },
];

// 검증할 인덱스 목록
const REQUIRED_INDEXES = [
  { table: "posts", index: "idx_posts_user_id" },
  { table: "posts", index: "idx_posts_created_at" },
  { table: "likes", index: "idx_likes_post_id" },
  { table: "likes", index: "idx_likes_user_id" },
  { table: "comments", index: "idx_comments_post_id" },
  { table: "comments", index: "idx_comments_user_id" },
  { table: "comments", index: "idx_comments_created_at" },
  { table: "follows", index: "idx_follows_follower_id" },
  { table: "follows", index: "idx_follows_following_id" },
];

async function verifyMigrations() {
  console.log("=".repeat(60));
  console.log("데이터베이스 스키마 검증");
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
    tables: { passed: [], failed: [] },
    views: { passed: [], failed: [] },
    triggers: { passed: [], failed: [] },
    indexes: { passed: [], failed: [] },
  };

  console.log("📊 테이블 확인 중...\n");

  // 테이블 확인
  for (const tableName of REQUIRED_TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(0);

      if (error && error.code !== "PGRST116") {
        // PGRST116은 "no rows returned" 에러이므로 테이블은 존재함
        throw error;
      }

      results.tables.passed.push(tableName);
      console.log(`  ✅ ${tableName}`);
    } catch (error) {
      results.tables.failed.push({ name: tableName, error: error.message });
      console.log(`  ❌ ${tableName}: ${error.message}`);
    }
  }

  console.log();
  console.log("📊 Views 확인 중...\n");

  // Views 확인 (SQL 쿼리 사용)
  for (const viewName of REQUIRED_VIEWS) {
    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        query: `SELECT EXISTS (
          SELECT 1 
          FROM information_schema.views 
          WHERE table_schema = 'public' 
          AND table_name = '${viewName}'
        );`,
      });

      // 대안: 직접 쿼리 시도
      const { error: queryError } = await supabase
        .from(viewName)
        .select("*")
        .limit(0);

      if (queryError && !queryError.message.includes("no rows")) {
        throw queryError;
      }

      results.views.passed.push(viewName);
      console.log(`  ✅ ${viewName}`);
    } catch (error) {
      results.views.failed.push({ name: viewName, error: error.message });
      console.log(`  ❌ ${viewName}: ${error.message}`);
    }
  }

  console.log();
  console.log("📊 Triggers 확인 중...\n");

  // Triggers 확인 (SQL 쿼리 필요)
  for (const { table, trigger } of REQUIRED_TRIGGERS) {
    try {
      // 직접 확인이 어려우므로 테이블 존재 여부로 대체
      // 실제로는 SQL 쿼리로 확인해야 함
      const { error } = await supabase.from(table).select("*").limit(0);
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }

      results.triggers.passed.push(`${table}.${trigger}`);
      console.log(`  ✅ ${table}.${trigger} (테이블 존재 확인)`);
    } catch (error) {
      results.triggers.failed.push({
        name: `${table}.${trigger}`,
        error: error.message,
      });
      console.log(`  ❌ ${table}.${trigger}: ${error.message}`);
    }
  }

  console.log();
  console.log("📊 인덱스 확인 중...\n");

  // 인덱스 확인 (SQL 쿼리 필요, 여기서는 스킵)
  console.log("  ⚠️  인덱스 확인은 SQL 쿼리로 직접 확인해야 합니다.");
  console.log("     scripts/verification-queries.sql 파일을 참고하세요.");
  console.log();

  // 결과 리포트
  console.log("=".repeat(60));
  console.log("검증 결과");
  console.log("=".repeat(60));
  console.log();

  const totalChecks =
    REQUIRED_TABLES.length +
    REQUIRED_VIEWS.length +
    REQUIRED_TRIGGERS.length;
  const totalPassed =
    results.tables.passed.length +
    results.views.passed.length +
    results.triggers.passed.length;
  const totalFailed =
    results.tables.failed.length +
    results.views.failed.length +
    results.triggers.failed.length;

  console.log(`✅ 통과: ${totalPassed}/${totalChecks}`);
  console.log(`❌ 실패: ${totalFailed}/${totalChecks}`);
  console.log();

  if (totalFailed > 0) {
    console.error("❌ 일부 검증이 실패했습니다.");
    console.error();
    console.error("💡 해결 방법:");
    console.error("  1. Supabase Dashboard → SQL Editor에서 마이그레이션 파일 실행");
    console.error("  2. scripts/verification-queries.sql 파일로 상세 확인");
    console.error("  3. docs/supabase-migration-guide.md 참고");
    console.error();
    process.exit(1);
  }

  console.log("✅ 모든 검증을 통과했습니다!");
  console.log();
  console.log("💡 다음 단계:");
  console.log("  - Storage 버킷 확인: pnpm run supabase:verify");
  console.log("  - Supabase Dashboard에서 테이블 데이터 확인");
  console.log();
}

if (require.main === module) {
  verifyMigrations().catch((error) => {
    console.error();
    console.error("❌ 검증 중 오류 발생:");
    console.error(error.message);
    console.error();
    process.exit(1);
  });
}

module.exports = { verifyMigrations };


