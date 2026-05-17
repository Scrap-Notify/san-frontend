import { HomeSectionTitle } from '../layout/HomeSectionTitle';
import { KnowledgePlanetPrototype } from './KnowledgePlanetPrototype';

export function GraphSection() {
  return (
    <div className="flex flex-col gap-dashboard-gap">
      <HomeSectionTitle>나의 지식 그래프</HomeSectionTitle>
      <KnowledgePlanetPrototype />
    </div>
  );
}
