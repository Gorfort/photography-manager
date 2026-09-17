// Backend base URL, injected at build time via VITE_API_URL (see .github/workflows/deploy-pages.yml)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const API_URL = `${API_BASE_URL}/api`;
