# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 통합하는 방법을 설명합니다. 2025년 4월부터 권장되는 방식입니다.

## 개요

Clerk와 Supabase의 네이티브 통합을 사용하면:
- JWT 템플릿이 필요 없습니다 (deprecated)
- Clerk 세션 토큰이 자동으로 Supabase에 전달됩니다
- Supabase가 Clerk 세션 토큰을 검증하여 인증된 사용자로 처리합니다
- RLS 정책에서 `auth.jwt()->>'sub'`로 Clerk user ID를 확인할 수 있습니다

## 설정 단계

### 1. Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속
2. **Setup** → **Supabase** 메뉴로 이동 (또는 [직접 링크](https://dashboard.clerk.com/setup/supabase))
3. 설정 옵션을 선택하고 **"Activate Supabase integration"** 클릭
4. 표시되는 **Clerk domain**을 복사 (예: `your-app-12.clerk.accounts.dev`)

> **중요**: 이 단계를 완료하면 Clerk 세션 토큰에 `"role": "authenticated"` JWT claim이 자동으로 추가됩니다.

### 2. Supabase에서 Clerk를 Third-Party Auth Provider로 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)로 이동
2. 프로젝트 선택 → **Authentication** → **Sign In / Up** 메뉴
3. **"Add provider"** 클릭
4. 제공자 목록에서 **"Clerk"** 선택
5. **1단계**에서 복사한 **Clerk domain**을 붙여넣기
6. **"Save"** 또는 **"Add Provider"** 클릭

### 3. 환경 변수 설정

`.env` 파일에 다음 환경 변수가 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 코드 사용 방법

### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error) setTasks(data);
      setLoading(false);
    }
    loadTasks();
  }, [supabase]);

  async function createTask(name: string) {
    const { error } = await supabase.from('tasks').insert({ name });
    if (!error) {
      // 새로고침 또는 상태 업데이트
      window.location.reload();
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Tasks</h1>
      {tasks.map((task) => (
        <p key={task.id}>{task.name}</p>
      ))}
    </div>
  );
}
```

### Server Component에서 사용

```tsx
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function TasksData() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tasks').select('*');

  if (error) {
    throw error;
  }

  return (
    <div>
      <h1>Tasks</h1>
      {data?.map((task) => (
        <p key={task.id}>{task.name}</p>
      ))}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksData />
    </Suspense>
  );
}
```

### Server Action에서 사용

```ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tasks').insert({ name });

  if (error) {
    throw new Error('Failed to add task');
  }
}
```

## RLS 정책 설정

Supabase에서 RLS 정책을 설정하여 사용자가 자신의 데이터만 접근할 수 있도록 합니다:

```sql
-- 테이블 생성 (예: tasks)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub'
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);
```

> **참고**: 개발 환경에서는 RLS를 비활성화할 수 있지만, 프로덕션에서는 반드시 활성화해야 합니다.

## 문제 해결

### "Missing Supabase environment variables" 오류

`.env` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되어 있는지 확인하세요.

### "Unauthorized" 오류

1. Clerk Dashboard에서 Supabase 통합이 활성화되어 있는지 확인
2. Supabase Dashboard에서 Clerk가 Third-Party Auth Provider로 추가되어 있는지 확인
3. RLS 정책이 올바르게 설정되어 있는지 확인

### 토큰이 전달되지 않는 경우

- Client Component에서는 `useClerkSupabaseClient()` hook을 사용해야 합니다
- Server Component/Server Action에서는 `await createClient()` 함수를 사용해야 합니다
- 사용자가 로그인되어 있는지 확인하세요

## 참고 자료

- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Clerk Supabase Next.js 데모](https://github.com/clerk/clerk-supabase-nextjs)

