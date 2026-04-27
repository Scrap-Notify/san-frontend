// /packages/dashboard/tailwind.config.js
import sharedConfig from '../../tailwind.config.js'; // require 대신 import 사용

/** @type {import('tailwindcss').Config} */
export default { // module.exports 대신 export default 사용
  ...sharedConfig, 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}", // shared 패키지 UI도 감시!
  ],
}