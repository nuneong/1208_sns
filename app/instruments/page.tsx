import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Instruments 페이지
 *
 * Supabase 공식 문서의 예제를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * 이 페이지는 `instruments` 테이블의 데이터를 조회하여 표시합니다.
 * 테이블 생성 및 RLS 정책 설정은 Supabase Dashboard의 SQL Editor에서 실행하세요.
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    console.error("Error fetching instruments:", error);
    return (
      <div className="p-4 text-red-600">
        <p>Error loading instruments: {error.message}</p>
        <p className="mt-2 text-sm text-gray-600">
          Make sure you have created the `instruments` table in Supabase and
          set up the RLS policy.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4">
        <p>No instruments found.</p>
        <p className="mt-2 text-sm text-gray-600">
          Add some data to the `instruments` table in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Instruments</h1>
      <ul className="space-y-2">
        {instruments.map((instrument: { id: number; name: string }) => (
          <li key={instrument.id} className="rounded bg-gray-100 p-2">
            {instrument.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div className="p-4">Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

