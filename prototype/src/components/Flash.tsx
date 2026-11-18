"use client";

import { useSearchParams } from "next/navigation";

/** Shows ?notice= / ?error= messages set by server actions. */
export function Flash() {
  const params = useSearchParams();
  const notice = params.get("notice");
  const error = params.get("error");
  if (!notice && !error) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
        error ? "border-rose-300 bg-rose-50 text-rose-900" : "border-emerald-300 bg-emerald-50 text-emerald-900"
      }`}
    >
      {error ?? notice}
    </div>
  );
}
