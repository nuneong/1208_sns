#!/usr/bin/env node

/**
 * @file apply-migrations.js
 * @description Supabase 마이그레이션 자동 적용 스크립트
 *
 * 이 스크립트는 Supabase CLI를 사용하여 마이그레이션 파일을 자동으로 적용합니다.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { checkSupabaseCLI, checkSupabaseProject } = require("./check-supabase-cli.js");

const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");

// 마이그레이션 파일 순서 (타임스탬프 순서)
const MIGRATION_FILES = [
  "20250115000000_create_sns_schema.sql",
  "20250115000001_create_posts_storage.sql",
];

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ 마이그레이션 디렉토리를 찾을 수 없습니다: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort(); // 타임스탬프 순서로 정렬
  
  return files;
}

function applyMigrations() {
  console.log("=".repeat(60));
  console.log("Supabase 마이그레이션 적용");
  console.log("=".repeat(60));
  console.log();
  
  // Supabase CLI 확인
  const cliInstalled = checkSupabaseCLI();
  if (!cliInstalled) {
    console.error();
    console.error("❌ Supabase CLI가 필요합니다.");
    console.error("   npm install -g supabase");
    console.error();
    console.error("   또는 Supabase Dashboard에서 수동으로 마이그레이션을 적용하세요:");
    console.error("   docs/supabase-migration-guide.md를 참고하세요.");
    process.exit(1);
  }
  
  // 프로젝트 연결 확인
  const projectLinked = checkSupabaseProject();
  if (!projectLinked) {
    console.error();
    console.error("❌ Supabase 프로젝트가 연결되어 있지 않습니다.");
    console.error("   supabase link --project-ref <your-project-ref>");
    console.error();
    process.exit(1);
  }
  
  console.log("📁 마이그레이션 파일 확인 중...\n");
  
  const allFiles = getMigrationFiles();
  const targetFiles = MIGRATION_FILES.filter((file) =>
    allFiles.includes(file)
  );
  
  if (targetFiles.length === 0) {
    console.error("❌ 마이그레이션 파일을 찾을 수 없습니다.");
    console.error(`   예상 파일: ${MIGRATION_FILES.join(", ")}`);
    process.exit(1);
  }
  
  console.log(`✅ ${targetFiles.length}개의 마이그레이션 파일을 찾았습니다:\n`);
  targetFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();
  
  console.log("🚀 마이그레이션 적용 중...\n");
  
  try {
    // Supabase CLI를 사용하여 마이그레이션 적용
    // supabase db push는 로컬 마이그레이션을 원격으로 푸시합니다
    execSync("supabase db push", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
    
    console.log();
    console.log("=".repeat(60));
    console.log("✅ 마이그레이션 적용 완료!");
    console.log("=".repeat(60));
    console.log();
    console.log("💡 다음 단계:");
    console.log("  1. 마이그레이션 검증: pnpm run supabase:verify");
    console.log("  2. 테이블 확인: Supabase Dashboard → Table Editor");
    console.log("  3. Storage 버킷 확인: Supabase Dashboard → Storage");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ 마이그레이션 적용 실패");
    console.error("=".repeat(60));
    console.error();
    console.error("에러 내용:");
    console.error(error.message);
    console.error();
    console.error("💡 문제 해결:");
    console.error("  1. Supabase 프로젝트 연결 확인: supabase link");
    console.error("  2. 환경 변수 확인: pnpm run check:env");
    console.error("  3. Supabase Dashboard에서 수동으로 마이그레이션 적용");
    console.error("     docs/supabase-migration-guide.md를 참고하세요.");
    console.error();
    process.exit(1);
  }
}

if (require.main === module) {
  applyMigrations();
}

module.exports = { applyMigrations, getMigrationFiles };


