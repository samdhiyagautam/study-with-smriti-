/** Feedback banner driven by ?status=…&msg=… after a redirecting action. */
export function StatusNotice({
  status,
  msg,
}: {
  status?: string;
  msg?: string;
}) {
  if (!status) return null;

  if (status === "error") {
    return (
      <p
        role="alert"
        className="mb-6 rounded-lg border border-error/40 bg-error-soft px-4 py-3 text-sm font-medium text-error"
      >
        {msg || "Something went wrong. Please try again."}
      </p>
    );
  }

  const label =
    status === "deleted"
      ? "Deleted."
      : status === "saved"
        ? "Saved."
        : status === "uploaded"
          ? "Uploaded."
          : null;

  if (!label) return null;

  return (
    <p
      role="status"
      className="mb-6 rounded-lg border border-success/40 bg-secondary-soft px-4 py-3 text-sm font-medium text-success"
    >
      {msg ? `${label} ${msg}` : label}
    </p>
  );
}

/** Shown on every admin screen until Supabase keys are configured. */
export function NotConfigured({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-warning/40 bg-highlight p-6">
      <h1 className="text-xl font-bold">{what}</h1>
      <p className="mt-2 text-sm text-muted">
        Supabase is not configured. Add your project keys to{" "}
        <code className="rounded bg-surface px-1">.env.local</code> to manage {what.toLowerCase()}
        .
      </p>
    </div>
  );
}
