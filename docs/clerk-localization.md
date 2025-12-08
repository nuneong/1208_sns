# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 이 프로젝트는 한국어(ko-KR) 로컬라이제이션을 사용합니다.

> **참고**: Clerk 로컬라이제이션 기능은 현재 실험적(experimental) 단계입니다. 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

## 설정 방법

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```bash
pnpm install @clerk/localizations
```

### 2. 한국어 로컬라이제이션 적용

`app/layout.tsx`에서 한국어 로컬라이제이션을 적용합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        {children}
      </html>
    </ClerkProvider>
  );
}
```

## 커스텀 메시지 설정

기본 한국어 로컬라이제이션에 커스텀 메시지를 추가할 수 있습니다:

```tsx
import { koKR } from "@clerk/localizations";

const koreanLocalization = {
  ...koKR,
  // 커스텀 에러 메시지
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 기업 이메일 도메인을 허용 목록에 추가하려면 이메일로 문의해주세요.",
  },
};

<ClerkProvider localization={koreanLocalization}>
  {/* ... */}
</ClerkProvider>
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

- 한국어 (ko-KR) - `koKR`
- 영어 (en-US) - `enUS` (기본값)
- 일본어 (ja-JP) - `jaJP`
- 중국어 간체 (zh-CN) - `zhCN`
- 중국어 번체 (zh-TW) - `zhTW`
- 기타 50개 이상의 언어

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 주의사항

1. **실험적 기능**: 로컬라이제이션 기능은 현재 실험적 단계입니다.
2. **Clerk Account Portal**: 로컬라이제이션은 Clerk 컴포넌트에만 적용되며, 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 영어로 유지됩니다.
3. **커스텀 메시지**: `unstable__errors` 키를 사용하여 에러 메시지를 커스터마이징할 수 있습니다.

## 에러 메시지 커스터마이징

모든 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 `unstable__errors` 객체를 검색하여 확인할 수 있습니다.

예시:

```tsx
const localization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 특정 에러 메시지 커스터마이징
    form_identifier_not_found: "이메일 또는 사용자 이름을 찾을 수 없습니다.",
    form_password_pwned: "이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.",
  },
};
```

## 현재 프로젝트 설정

현재 프로젝트는 `app/layout.tsx`에서 다음과 같이 설정되어 있습니다:

- 기본 한국어 로컬라이제이션 (`koKR`) 사용
- 커스텀 에러 메시지 추가 (`not_allowed_access`)
- HTML `lang` 속성을 `"ko"`로 설정

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk 로컬라이제이션 GitHub 저장소](https://github.com/clerk/javascript/tree/main/packages/localizations)

