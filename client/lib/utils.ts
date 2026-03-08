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

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<TryCatchResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: any) {
    const message =
      errorMessage ||
      err?.response?.data?.detail ||
      err?.message ||
      "An error occurred";
    return { success: false, error: message };
  }
}
