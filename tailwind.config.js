/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/pages/**/*.{js,jsx}",
        "./src/components/**/*.{js,jsx}",
        "./src/app/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'hsl(142, 76%, 36%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
            },
        },
    },
    plugins: [],
}
