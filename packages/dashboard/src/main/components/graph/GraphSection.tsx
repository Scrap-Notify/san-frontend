import { useEffect, useState } from 'react';
import { authTokenStorage } from '@dashboard/api/client';
import { HomeSectionTitle } from '../layout/HomeSectionTitle';
import { KnowledgePlanetPrototype } from './KnowledgePlanetPrototype';

export function GraphSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let ignore = false;

    authTokenStorage.getToken().then((token) => {
      if (!ignore) setIsAuthenticated(Boolean(token));
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-dashboard-gap">
      <HomeSectionTitle>나의 지식 숲</HomeSectionTitle>
      <KnowledgePlanetPrototype showMarkers={isAuthenticated} />
    </div>
  );
}
