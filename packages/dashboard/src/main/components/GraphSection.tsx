import { useNavigate } from 'react-router-dom';
import { HomeGraphEmptyState } from './HomeEmptyStates';
import { HomeSectionTitle } from './HomeSectionTitle';

export function GraphSection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-dashboard-gap">
      <HomeSectionTitle>
        나의 지식 숲
      </HomeSectionTitle>
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
