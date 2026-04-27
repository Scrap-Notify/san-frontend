// /packages/dashboard/tailwind.config.js
const sharedConfig = require('../../tailwind.config.js'); // 루트 설정 가져오기 (상속 받아서 사용)

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig, // 루트 설정 복사
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}", // shared 패키지 UI도 감시!
  ],
}