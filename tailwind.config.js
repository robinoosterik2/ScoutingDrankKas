/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],

  theme: {
		extend: {
			colors: {
				primary: "#1E40AF", // Blue-700
				"primary-dark": "#3B82F6", // Blue-500
				secondary: "#6B7280", // Gray-500
				"secondary-dark": "#9CA3AF", // Gray-400
				accent: "#D97706", // Amber-600
				"accent-dark": "#F59E0B", // Amber-500
				"accent-hover": "#C2410C", // Amber-700
				"accent-dark-hover": "#FBBF24", // Amber-400
			},
			fontSize: {
				'xxs': '0.625rem', // Custom size, e.g., 10px
				'xxxs': '0.5rem', // Custom size, e.g., 8px
			},
		},
	},
  darkMode: 'class',
  plugins: [],
}

