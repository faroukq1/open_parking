import axios from "axios";

const DEFAULT_BASE_URL = "http://localhost:8000";

const normalizeBaseUrl = (value?: string): string => {
  const raw = (value || DEFAULT_BASE_URL).trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }

  // Local/private IPs are usually served over plain HTTP in dev.
  const isLocalHost =
    raw.includes("localhost") ||
    raw.startsWith("127.") ||
    raw.startsWith("10.") ||
    raw.startsWith("192.168.");

  const protocol = isLocalHost ? "http" : "https";
  return `${protocol}://${raw}`.replace(/\/$/, "");
};

const BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_BASE_URL);

const customFetch = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export default customFetch;
