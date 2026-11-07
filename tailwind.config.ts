import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { ink: "#101828", muted: "#667085", brand: "#e5484d", canvas: "#f6f8fb" }, boxShadow: { soft: "0 8px 30px rgba(16,24,40,.06)" } } },
  plugins: []
};
export default config;
