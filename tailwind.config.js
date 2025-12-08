/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                'primary-green': '#61CE70',
                'primary-blue': '#2A7ADA',
                'secondary-blue': '#0C335A',
            }
        },
    },
    plugins: [],
}
