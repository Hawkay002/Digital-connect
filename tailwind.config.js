/** @type {import('tailwindcss').Config} */
import { motionwind } from "motionwind-react/tailwind"; // 🌟 ADD THIS

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: '#18181b',
        brandAccent: '#27272a',
        brandMuted: '#f4f4f5',
        brandGold: '#cda434',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'floating': '0 -10px 40px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [
    motionwind() // 🌟 ADD THIS
  ],
}
