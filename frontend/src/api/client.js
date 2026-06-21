import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getOptions() {
  const res = await axios.get(`${API_URL}/options`);
  return res.data;
}

export async function analyzeEvent(payload) {
  const res = await axios.post(`${API_URL}/analyze`, payload);
  return res.data;
}