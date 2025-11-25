/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6f7f9',
                    100: '#b3e6ee',
                    200: '#80d5e2',
                    300: '#4dc4d7',
                    400: '#1ab3cb',
                    500: '#028090',
                    600: '#026673',
                    700: '#014d56',
                    800: '#013339',
                    900: '#001a1d',
                },
                secondary: {
                    50: '#e6fbf9',
                    100: '#b3f3ed',
                    200: '#80ebe0',
                    300: '#4de3d4',
                    400: '#1adbc8',
                    500: '#00a896',
                    600: '#008678',
                    700: '#00655a',
                    800: '#00433c',
                    900: '#00221e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
