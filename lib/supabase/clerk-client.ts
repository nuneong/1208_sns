"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 네이티브 통합 방식:
 * - JWT 템플릿 불필요 (deprecated)
 * - Clerk Dashboard에서 Supabase 통합 활성화 필요
 * - useAuth().getToken()으로 현재 세션 토큰을 Supabase에 전달
 * - Supabase가 Clerk 세션 토큰을 자동으로 검증
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useEffect, useState } from 'react';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *   const [data, setData] = useState([]);
 *
 *   useEffect(() => {
 *     async function fetchData() {
 *       const { data, error } = await supabase.from('table').select('*');
 *       if (!error) setData(data);
 *     }
 *     fetchData();
 *   }, [supabase]);
 *
 *   return <div>{/* ... */}</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // Clerk 세션 토큰을 Supabase에 전달
        // Supabase는 이 토큰을 검증하여 인증된 사용자로 처리
        return (await getToken()) ?? null;
      },
    });
  }, [getToken]);

  return supabase;
}
