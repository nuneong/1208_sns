#!/usr/bin/env node

/**
 * @file setup-supabase.js
 * @description 전체 Supabase 설정 자동화 스크립트
 *
 * 이 스크립트는 Supabase 설정의 모든 단계를 자동으로 실행하고 검증합니다.
 */

const { checkSupabaseCLI, checkSupabaseProject } = require("./check-supabase-cli.js");
const { applyMigrations } = require("./apply-migrations.js");
const { verifyMigrations } = require("./verify-migrations.js");
const { verifyStorage } = require("./verify-storage.js");

async function setupSupabase() {
  console.log("=".repeat(60));
  console.log("Supabase 전체 설정 자동화");
  console.log("=".repeat(60));
  console.log();

  const steps = [
    { name: "환경 변수 확인", fn: () => require("./check-env.js").checkEnvVars() },
    { name: "Supabase CLI 확인", fn: checkSupabaseCLI },
    { name: "프로젝트 연결 확인", fn: checkSupabaseProject },
  ];

  // 1단계: 사전 확인
  console.log("📋 1단계: 사전 확인\n");
  
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (result === false && step.name !== "프로젝트 연결 확인") {
        console.error(`\n❌ ${step.name} 실패`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ ${step.name} 중 오류: ${error.message}`);
      process.exit(1);
    }
  }

  console.log();
  console.log("=".repeat(60));
  console.log();

  // 2단계: 마이그레이션 적용
  console.log("📋 2단계: 마이그레이션 적용\n");
  
  try {
    applyMigrations();
  } catch (error) {
    console.error("\n❌ 마이그레이션 적용 실패");
    console.error("   Supabase Dashboard에서 수동으로 마이그레이션을 적용하세요.");
    console.error("   docs/supabase-migration-guide.md를 참고하세요.");
    process.exit(1);
  }

  console.log();
  console.log("=".repeat(60));
  console.log();

  // 3단계: 검증
  console.log("📋 3단계: 검증\n");

  try {
    await verifyMigrations();
    console.log();
    await verifyStorage();
  } catch (error) {
    console.error("\n⚠️  검증 중 일부 오류가 발생했습니다.");
    console.error("   scripts/verification-queries.sql 파일로 상세 확인하세요.");
  }

  console.log();
  console.log("=".repeat(60));
  console.log("✅ Supabase 설정 완료!");
  console.log("=".repeat(60));
  console.log();
  console.log("💡 다음 단계:");
  console.log("  - Supabase Dashboard에서 테이블 및 Storage 확인");
  console.log("  - 애플리케이션에서 데이터베이스 연결 테스트");
  console.log();
}

if (require.main === module) {
  setupSupabase().catch((error) => {
    console.error();
    console.error("❌ 설정 중 오류 발생:");
    console.error(error.message);
    console.error();
    process.exit(1);
  });
}

module.exports = { setupSupabase };


