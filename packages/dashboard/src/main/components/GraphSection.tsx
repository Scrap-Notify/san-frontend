import { useNavigate } from 'react-router-dom';
import { HomeGraphEmptyState } from './HomeEmptyStates';

export function GraphSection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-dashboard-gap">
      <h2 className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-h1-bold text-transparent">
        나의 지식의 숲
      </h2>
      <HomeGraphEmptyState
        primaryAction={{
          label: '첫 씨앗 심기',
          onClick: () => navigate('/til'),
        }}
        secondaryAction={{
          label: '아카이브 보기',
          onClick: () => navigate('/result'),
        }}
      />
    </div>
  );
}
