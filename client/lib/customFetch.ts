import axios from "axios";
import Constants from "expo-constants";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8000";

const customFetch = axios.create({
  baseURL: BASE_URL,
});

export default customFetch;
