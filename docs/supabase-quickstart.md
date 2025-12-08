# Supabase Quickstart 가이드

이 문서는 Supabase 공식 문서의 모범 사례를 따라 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 개요

이 프로젝트는 Supabase 공식 문서의 패턴을 따르면서 Clerk 인증을 통합합니다:

- Supabase 공식 문서 스타일의 `createClient()` 함수 사용
- Clerk 세션 토큰을 Supabase에 전달하여 인증
- Server Component와 Server Action에서 사용

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# 또는 Supabase 공식 문서 스타일
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

> **참고**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`와 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 같은 값입니다. 둘 다 지원됩니다.

## 코드 사용 방법

### Server Component에서 사용

Supabase 공식 문서의 패턴을 따릅니다:

```tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function DataComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select();

  if (error) throw error;

  return <div>{/* ... */}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

### Server Action에서 사용

```ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function addItem(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({ name });

  if (error) {
    throw new Error("Failed to add item");
  }
}
```

### Client Component에서 사용

Clerk 통합을 사용하는 경우:

```tsx
"use client";

import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useEffect, useState } from "react";

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("table").select();
      if (!error) setData(data);
    }
    fetchData();
  }, [supabase]);

  return <div>{/* ... */}</div>;
}
```

## 예제: Instruments 테이블

Supabase 공식 문서의 예제를 따라 `instruments` 테이블을 생성할 수 있습니다:

### 1. 테이블 생성

Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행:

```sql
-- Create the table
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert sample data
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello');

-- Enable RLS
alter table instruments enable row level security;

-- Create policy for public read access
create policy "public can read instruments"
on public.instruments
for select
to anon
using (true);
```

또는 마이그레이션 파일을 사용:

```bash
# Supabase CLI를 사용하여 마이그레이션 실행
supabase db push
```

### 2. 데이터 조회

`/instruments` 페이지에서 데이터를 확인할 수 있습니다:

```tsx
// app/instruments/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();

  return (
    <div>
      {instruments?.map((instrument) => (
        <p key={instrument.id}>{instrument.name}</p>
      ))}
    </div>
  );
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
```

## Clerk 통합

이 프로젝트는 Clerk를 사용하여 인증을 처리합니다. Supabase 클라이언트는 자동으로 Clerk 세션 토큰을 전달합니다:

- **Server Component/Action**: `createClient()`가 자동으로 Clerk 토큰을 포함
- **Client Component**: `useClerkSupabaseClient()` hook 사용

자세한 내용은 [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)를 참고하세요.

## 참고 자료

- [Supabase 공식 Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)

