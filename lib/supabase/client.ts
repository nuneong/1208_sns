import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (인증 불필요한 공개 데이터용)
 *
 * 이 클라이언트는 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 `to anon`인 데이터만 접근 가능합니다.
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * @example
 * ```tsx
 * import { supabase } from '@/lib/supabase/client';
 *
 * // 공개 데이터 조회
 * const { data } = await supabase.from('public_posts').select('*');
 * ```
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
