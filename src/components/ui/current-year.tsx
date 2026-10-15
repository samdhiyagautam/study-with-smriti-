"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current year on the client. `new Date()` is not allowed while
 * statically prerendering in Next.js, so the value is set after mount.
 */
export function CurrentYear() {
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return <>{year}</>;
}
