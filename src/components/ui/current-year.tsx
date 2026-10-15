"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Current year, resolved on the client only: `new Date()` is not allowed
 * while statically prerendering, so the server snapshot is an empty string
 * and React swaps in the real value right after hydration.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noop,
    () => String(new Date().getFullYear()),
    () => "",
  );

  return <>{year}</>;
}
