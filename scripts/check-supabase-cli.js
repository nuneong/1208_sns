#!/usr/bin/env node

/**
 * @file check-supabase-cli.js
 * @description Supabase CLI 설치 확인 스크립트
 *
 * 이 스크립트는 Supabase CLI가 설치되어 있는지 확인하고,
 * 미설치 시 설치 안내 메시지를 표시합니다.
 */

const { execSync } = require("child_process");
const { checkEnvVars } = require("./check-env.js");

function checkSupabaseCLI() {
  console.log("🔍 Supabase CLI 확인 중...\n");
  
  try {
    // Supabase CLI 버전 확인
    const version = execSync("supabase --version", { encoding: "utf-8" }).trim();
    console.log(`✅ Supabase CLI가 설치되어 있습니다: ${version}\n`);
    return true;
  } catch (error) {
    console.error("❌ Supabase CLI가 설치되어 있지 않습니다.\n");
    console.error("💡 설치 방법:");
    console.error();
    console.error("  방법 1: npm을 사용한 전역 설치");
    console.error("    npm install -g supabase");
    console.error();
    console.error("  방법 2: npx를 사용한 실행 (설치 없이 사용)");
    console.error("    npx supabase <command>");
    console.error();
    console.error("  방법 3: Supabase Dashboard 사용");
    console.error("    Supabase Dashboard → SQL Editor에서 마이그레이션 파일 직접 실행");
    console.error();
    console.error("  자세한 내용은 다음 문서를 참고하세요:");
    console.error("  - https://supabase.com/docs/guides/cli");
    console.error("  - docs/supabase-migration-guide.md");
    console.error();
    return false;
  }
}

function checkSupabaseProject() {
  console.log("🔍 Supabase 프로젝트 연결 확인 중...\n");
  
  try {
    // supabase status 명령어로 프로젝트 연결 확인
    execSync("supabase status", { encoding: "utf-8", stdio: "ignore" });
    console.log("✅ Supabase 프로젝트가 연결되어 있습니다.\n");
    return true;
  } catch (error) {
    console.warn("⚠️  Supabase 프로젝트가 연결되어 있지 않습니다.\n");
    console.warn("💡 프로젝트 연결 방법:");
    console.warn();
    console.warn("  1. Supabase Dashboard에서 프로젝트 참조 ID 확인");
    console.warn("  2. 다음 명령어 실행:");
    console.warn("     supabase link --project-ref <your-project-ref>");
    console.warn();
    console.warn("  또는 Supabase Dashboard에서 직접 마이그레이션을 실행할 수 있습니다.");
    console.warn("  자세한 내용은 docs/supabase-migration-guide.md를 참고하세요.");
    console.warn();
    return false;
  }
}

function main() {
  console.log("=".repeat(60));
  console.log("Supabase CLI 초기화 확인");
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
  
  // Supabase CLI 확인
  const cliInstalled = checkSupabaseCLI();
  if (!cliInstalled) {
    console.log();
    console.log("💡 Supabase CLI 없이도 Supabase Dashboard를 통해 마이그레이션을 적용할 수 있습니다.");
    console.log("   docs/supabase-migration-guide.md를 참고하세요.");
    process.exit(0); // CLI가 없어도 에러로 처리하지 않음 (대안 방법 존재)
  }
  
  // 프로젝트 연결 확인
  checkSupabaseProject();
  
  console.log("=".repeat(60));
  console.log("✅ 초기화 확인 완료");
  console.log("=".repeat(60));
}

if (require.main === module) {
  main();
}

module.exports = { checkSupabaseCLI, checkSupabaseProject };


