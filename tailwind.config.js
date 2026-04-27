/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        background: "#101417", // 심해의 어둠
        primary: {
          neon: "#00FFC2",   // Neon Mint (발광점)
          mist: "#1E5056",   // Misty Teal (안개)
        },
        surface: {
          glass: "rgba(24, 28, 31, 0.4)", // 글래스모피즘 베이스
        }
      },
      borderRadius: {
        'leaf': '3rem 0.5rem 3rem 0.5rem', // 우리가 합의한 Leaf-Curve
      }
    },
  },
  plugins: [],
}