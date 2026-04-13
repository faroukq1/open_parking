// Utility function for classnames (chadcn/ui)
export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(" ");
}

// Handle try-catch blocks with error handling
interface TryCatchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function extractErrorMessage(
  err: unknown,
  fallback = "An error occurred",
): string {
  const maybeError = err as any;
  const responseData = maybeError?.response?.data;
  const detail = responseData?.detail;
  const message = responseData?.message;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => (typeof item === "string" ? item : item?.msg || ""))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (typeof maybeError?.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallback;
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<TryCatchResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: any) {
    const message = extractErrorMessage(
      err,
      errorMessage || "An error occurred",
    );
    return { success: false, error: message };
  }
}
