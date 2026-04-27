import { useScrapStore } from './store/scrapStore'

function App() {
  // 스토어에서 viewMode 읽어오기
  const viewMode = useScrapStore((state) => state.viewMode);

  return (
  <div className="min-h-screen bg-[#101417] flex items-center justify-center">
    <h1 className="text-5xl font-bold text-primary-neon drop-shadow-[0_0_10px_#00FFC2]">
      SAN: 지식의 숲에 불이 켜졌습니다.
    </h1>
      <h1 className="text-primary-neon text-3xl font-bold">SAN Dashboard</h1>
      <p className="text-white opacity-70">
        현재 뷰 모드: <span className="text-yellow-400 font-mono">{viewMode}</span>
      </p>
  </div>
  )
}

export default App