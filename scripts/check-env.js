#!/usr/bin/env node

/**
 * @file check-env.js
 * @description 필수 환경 변수 확인 스크립트
 *
 * 이 스크립트는 프로젝트에 필요한 모든 환경 변수가 설정되어 있는지 확인합니다.
 */

const requiredEnvVars = {
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk Publishable Key",
  CLERK_SECRET_KEY: "Clerk Secret Key",
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: "Supabase Project URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Supabase Anon Key",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase Service Role Key (서버 사이드 전용)",
};

const optionalEnvVars = {
  NEXT_PUBLIC_STORAGE_BUCKET: "Storage Bucket Name (기본값: uploads)",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "Clerk Sign In URL",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "Clerk Sign In Fallback Redirect URL",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "Clerk Sign Up Fallback Redirect URL",
};

function checkEnvVars() {
  console.log("🔍 환경 변수 확인 중...\n");
  
  const missing = [];
  const present = [];
  
  // 필수 환경 변수 확인
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push({ key, description, required: true });
    } else {
      present.push({ key, description, required: true });
    }
  }
  
  // 선택적 환경 변수 확인
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[key];
    if (value && value.trim() !== "") {
      present.push({ key, description, required: false });
    }
  }
  
  // 결과 출력
  if (present.length > 0) {
    console.log("✅ 설정된 환경 변수:");
    present.forEach(({ key, description, required }) => {
      const marker = required ? "✓" : "○";
      const value = process.env[key];
      const maskedValue = key.includes("KEY") || key.includes("SECRET")
        ? `${value.substring(0, 8)}...` 
        : value;
      console.log(`  ${marker} ${key}: ${maskedValue} (${description})`);
    });
    console.log();
  }
  
  if (missing.length > 0) {
    console.error("❌ 누락된 필수 환경 변수:");
    missing.forEach(({ key, description }) => {
      console.error(`  ✗ ${key}: ${description}`);
    });
    console.error();
    console.error("💡 해결 방법:");
    console.error("  1. 프로젝트 루트에 .env 파일 생성");
    console.error("  2. 다음 환경 변수들을 추가:");
    missing.forEach(({ key }) => {
      console.error(`     ${key}=`);
    });
    console.error();
    console.error("  자세한 내용은 README.md를 참고하세요.");
    process.exit(1);
  }
  
  // 환경 변수 형식 검증
  console.log("🔎 환경 변수 형식 검증 중...\n");
  
  const validationErrors = [];
  
  // Supabase URL 형식 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    validationErrors.push("NEXT_PUBLIC_SUPABASE_URL은 https://로 시작해야 합니다.");
  }
  
  // Clerk Publishable Key 형식 확인
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey && !clerkKey.startsWith("pk_")) {
    validationErrors.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY은 pk_로 시작해야 합니다.");
  }
  
  if (validationErrors.length > 0) {
    console.error("⚠️  환경 변수 형식 오류:");
    validationErrors.forEach((error) => {
      console.error(`  ✗ ${error}`);
    });
    console.error();
    process.exit(1);
  }
  
  console.log("✅ 모든 필수 환경 변수가 올바르게 설정되었습니다!");
  console.log();
  return true;
}

// 스크립트 실행
if (require.main === module) {
  // .env 파일 로드 (dotenv가 설치되어 있는 경우)
  try {
    require("dotenv").config();
  } catch (e) {
    // dotenv가 없어도 계속 진행 (환경 변수는 이미 로드되어 있을 수 있음)
  }
  
  checkEnvVars();
}

module.exports = { checkEnvVars, requiredEnvVars, optionalEnvVars };


