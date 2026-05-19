import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { authTokenStorage } from '@dashboard/api/client';
import { HomeSectionTitle } from '../layout/HomeSectionTitle';
import { KnowledgePlanetPrototype } from './KnowledgePlanetPrototype';

export function GraphSection() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let ignore = false;
    authTokenStorage.getToken()
      .then((token) => { if (!ignore) setIsAuthenticated(Boolean(token)); })
      .finally(() => { if (!ignore) setIsChecking(false); });
    return () => { ignore = true; };
  }, []);

  if (!isChecking && !isAuthenticated) {
    return <ForestLanding onLogin={() => navigate('/login', { state: { from: '/' } })} />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute left-0 top-6 z-20 px-6">
        <HomeSectionTitle>나의 지식 숲</HomeSectionTitle>
      </div>
      {isChecking
        ? <div className="grid min-h-screen place-items-center"><span className="text-sm text-text-secondary">로딩 중...</span></div>
        : <KnowledgePlanetPrototype showMarkers />
      }
    </div>
  );
}

function ForestLanding({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[45%] h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-signal/[0.07] blur-2xl" />
        <div className="absolute left-[30%] top-[35%] h-2 w-2 rounded-full bg-primary-signal/20 blur-[1px]" />
        <div className="absolute left-[55%] top-[28%] h-1.5 w-1.5 rounded-full bg-primary-signal/15 blur-[1px]" />
        <div className="absolute left-[70%] top-[40%] h-2.5 w-2.5 rounded-full bg-primary-signal/10 blur-[1px]" />
        <div className="absolute left-[25%] top-[55%] h-1.5 w-1.5 rounded-full bg-primary-signal/20 blur-[1px]" />
        <div className="absolute left-[65%] top-[58%] h-2 w-2 rounded-full bg-primary-signal/15 blur-[1px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M30 35 Q50 25 55 45" fill="none" className="stroke-primary-signal" strokeWidth="0.3" strokeDasharray="1 0.8" />
          <path d="M55 45 Q65 40 70 50" fill="none" className="stroke-primary-signal" strokeWidth="0.3" strokeDasharray="1 0.8" />
          <path d="M30 55 Q40 50 55 45" fill="none" className="stroke-primary-signal" strokeWidth="0.3" strokeDasharray="1 0.8" />
        </svg>
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center gap-8 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-tl-[24px] rounded-br-[24px] rounded-tr-lg rounded-bl-lg border border-primary-signal/20 bg-primary-signal/5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="stroke-primary-signal" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12" />
            <path d="M12 12C12 12 8 9 5 10" />
            <path d="M12 12C12 12 16 9 19 10" />
            <path d="M12 8C12 8 9.5 5 7 6" />
            <path d="M12 8C12 8 14.5 5 17 6" />
            <circle cx="12" cy="4" r="1.5" />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            나만의 지식 숲을 키워보세요
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            흩어진 지식을 한곳에 모으면 자연스럽게 연결되고,<br />
            나무처럼 자라나는 당신만의 지식 체계가 됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogin}
          className="group flex items-center gap-2.5 rounded-tl-[16px] rounded-br-[16px] rounded-tr-lg rounded-bl-lg border border-primary-signal/30 bg-primary-signal/10 px-7 py-3.5 text-sm font-bold text-primary-signal transition-all hover:border-primary-signal/50 hover:bg-primary-signal/15"
        >
          로그인하고 시작하기
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>

        <p className="text-xs text-text-secondary/40">SAN · Scrap & Notify</p>
      </div>
    </div>
  );
}
