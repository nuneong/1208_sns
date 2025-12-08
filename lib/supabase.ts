import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * @deprecated Use `createClient()` from '@/lib/supabase/server' instead.
 * This file is kept for backward compatibility only.
 *
 * 새로운 코드에서는 다음을 사용하세요:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server';
 * const supabase = await createClient();
 * ```
 */
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
};
